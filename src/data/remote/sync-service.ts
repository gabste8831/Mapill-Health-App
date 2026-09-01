import { Platform } from "react-native";

import { getDatabase } from "../local/database";
import { supabase } from "./supabase-client";
import {
  COLUNAS_DE_ARQUIVO_LOCAL,
  COLUNAS_LOCAIS,
  COLUNAS_ORFAS,
  TABELAS_SINCRONIZAVEIS,
  type TabelaSincronizavel,
} from "./tabelas-sincronizaveis";

/** Web nunca persiste no SQLite (ver `useDatabaseReady`), então não há o que sincronizar. */
const persistsLocally = Platform.OS !== "web";

/**
 * Quantas linhas sobem por requisição.
 *
 * Não é performance: é o que impede uma sincronização inicial de 2 mil doses virar um único POST
 * gigante que falha inteiro por causa de uma linha. Em lotes, o que falha é o lote — e o resto já
 * está lá quando a próxima tentativa acontece.
 */
const TAMANHO_DO_LOTE = 200;

export type ResultadoDaSync = {
  enviados: number;
  recebidos: number;
  /** `null` quando deu tudo certo. Mensagem curta, para a UI mostrar sem interpretar. */
  erro: string | null;
};

/** Só o que a UI precisa saber. */
export type EstadoDaSync = {
  /** ISO da última sincronização bem-sucedida, ou `null` se nunca houve. */
  ultimaSync: string | null;
  /** Quantas linhas locais esperam subir. Zero = tudo espelhado. */
  pendentes: number;
};

/**
 * Onde fica a marca d'água do pull.
 *
 * Uma tabela local comum, e não `AsyncStorage`: a marca precisa ser apagada junto com os dados no
 * "apagar tudo", e o que mora no banco some com o banco. Guardada fora dele, ela sobreviveria ao
 * apagamento e o app concluiria que já baixou dados que não tem mais.
 */
const SQL_TABELA_DE_CONTROLE = `
CREATE TABLE IF NOT EXISTS sync_state (
  table_name TEXT PRIMARY KEY NOT NULL,
  last_pulled_at TEXT
);
`;

async function garantirTabelaDeControle(): Promise<void> {
  await getDatabase().execAsync(SQL_TABELA_DE_CONTROLE);
}

async function lerMarcaDagua(tabela: TabelaSincronizavel): Promise<string | null> {
  const row = await getDatabase().getFirstAsync<{ last_pulled_at: string | null }>(
    "SELECT last_pulled_at FROM sync_state WHERE table_name = ?",
    [tabela],
  );
  return row?.last_pulled_at ?? null;
}

async function gravarMarcaDagua(tabela: TabelaSincronizavel, quando: string): Promise<void> {
  await getDatabase().runAsync(
    `INSERT INTO sync_state (table_name, last_pulled_at) VALUES (?, ?)
     ON CONFLICT(table_name) DO UPDATE SET last_pulled_at = excluded.last_pulled_at`,
    [tabela, quando],
  );
}

/**
 * SQLite guarda booleano como 0/1 e data como texto; o Postgres tem os tipos de verdade.
 *
 * A conversão acontece **na borda**, aqui, e não no domínio: as entidades continuam falando em
 * `string` e `boolean` como sempre falaram, e quem conhece a diferença entre os dois bancos é a
 * camada que fala com os dois.
 */
function paraRemoto(
  linha: Record<string, unknown>,
  colunasBooleanas: string[],
  colunasOrfas: string[],
): Record<string, unknown> {
  const saida: Record<string, unknown> = {};
  for (const [coluna, valor] of Object.entries(linha)) {
    if ((COLUNAS_LOCAIS as readonly string[]).includes(coluna)) continue;
    // Colunas que a migration seguinte substituiu e o SQLite nunca removeu: enviá-las faz o
    // PostgREST recusar o lote inteiro, porque no servidor elas nunca existiram.
    if (colunasOrfas.includes(coluna)) continue;
    if (colunasBooleanas.includes(coluna)) {
      saida[coluna] = valor === 1 || valor === true;
      continue;
    }
    saida[coluna] = valor;
  }
  return saida;
}

function paraLocal(
  linha: Record<string, unknown>,
  colunasBooleanas: string[],
): Record<string, unknown> {
  const saida: Record<string, unknown> = {};
  for (const [coluna, valor] of Object.entries(linha)) {
    // `user_id` só existe no servidor: no aparelho o banco é de uma pessoa só, e guardar a coluna
    // localmente criaria um campo que nenhuma entidade conhece.
    if (coluna === "user_id") continue;
    if (colunasBooleanas.includes(coluna)) {
      saida[coluna] = valor === true ? 1 : 0;
      continue;
    }
    // O Postgres devolve `timestamptz` como ISO com offset; o app grava em UTC com `Z`.
    // Normalizar aqui evita duas representações do mesmo instante convivendo no SQLite.
    saida[coluna] =
      valor instanceof Date ? valor.toISOString() : (valor as string | number | null);
  }
  return saida;
}

/** As colunas booleanas de cada tabela — o SQLite as guarda como 0/1. */
const COLUNAS_BOOLEANAS: Record<TabelaSincronizavel, string[]> = {
  patient_profiles: ["photo_sync_opt_out"],
  consent_records: [],
  medications: ["from_cmed"],
  appointments: ["reminder_on_day"],
  prescriptions: ["attachment_sync_opt_out"],
  inventory_items: ["low_stock_alert_enabled"],
  dose_schedules: [],
  inventory_adjustments: [],
  intake_logs: [],
};

/**
 * Sobe o que mudou desde a última vez.
 *
 * O critério é `synced_at IS NULL OR updated_at > synced_at`: nunca subiu, ou mudou depois de ter
 * subido. Inclui as linhas com `deleted_at` preenchido — a exclusão é um dado que precisa viajar,
 * e uma linha apagada em silêncio voltaria do servidor no pull seguinte.
 */
async function enviar(tabela: TabelaSincronizavel, userId: string): Promise<number> {
  const database = getDatabase();
  const pendentes = await database.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM ${tabela} WHERE synced_at IS NULL OR updated_at > synced_at`,
  );
  if (pendentes.length === 0) return 0;

  const booleanas = COLUNAS_BOOLEANAS[tabela];
  const orfas = COLUNAS_ORFAS[tabela] ?? [];
  let enviados = 0;

  for (let i = 0; i < pendentes.length; i += TAMANHO_DO_LOTE) {
    const lote = pendentes.slice(i, i + TAMANHO_DO_LOTE);
    const payload = lote.map((linha) => ({
      ...paraRemoto(linha, booleanas, orfas),
      user_id: userId,
    }));

    const { error } = await supabase!.from(tabela).upsert(payload, { onConflict: "id" });
    if (error !== null) throw new Error(`${tabela}: ${error.message}`);

    /**
     * `synced_at` é carimbado **depois** da confirmação do servidor, e por linha.
     *
     * Carimbar antes marcaria como sincronizado o que talvez não tenha subido; carimbar a tabela
     * inteira de uma vez marcaria junto o que mudou durante o envio. O valor gravado é o
     * `updated_at` da própria linha: assim uma edição que aconteça agora, com `updated_at` maior,
     * continua pendente na próxima passada.
     */
    for (const linha of lote) {
      await database.runAsync(`UPDATE ${tabela} SET synced_at = ? WHERE id = ?`, [
        linha.updated_at as string,
        linha.id as string,
      ]);
    }
    enviados += lote.length;
  }

  return enviados;
}

/**
 * Baixa o que mudou no servidor desde a última passada.
 *
 * **Last-Write-Wins por `updated_at`** (§2.9.3): a linha remota só sobrescreve a local se for mais
 * nova. Tudo-ou-nada por registro, sem merge de campos — mesclar dois estados de uma prescrição
 * poderia produzir uma posologia que ninguém escreveu, e num app de medicação essa é a pior classe
 * de bug possível.
 *
 * O empate (mesmo `updated_at`) mantém o local. Não por preferência, mas porque o empate só
 * acontece quando os dois lados já têm a mesma coisa.
 */
async function receber(tabela: TabelaSincronizavel): Promise<number> {
  const database = getDatabase();
  const desde = await lerMarcaDagua(tabela);

  let consulta = supabase!.from(tabela).select("*").order("updated_at", { ascending: true });
  if (desde !== null) consulta = consulta.gt("updated_at", desde);

  const { data, error } = await consulta;
  if (error !== null) throw new Error(`${tabela}: ${error.message}`);
  if (data === null || data.length === 0) return 0;

  const booleanas = COLUNAS_BOOLEANAS[tabela];
  let recebidos = 0;
  let maiorUpdatedAt = desde;

  for (const remota of data as Record<string, unknown>[]) {
    const id = remota.id as string;
    const remotaUpdatedAt = new Date(remota.updated_at as string).toISOString();

    const local = await database.getFirstAsync<{ updated_at: string }>(
      `SELECT updated_at FROM ${tabela} WHERE id = ?`,
      [id],
    );

    // LWW: local igual ou mais novo vence, e a linha remota é descartada.
    if (local !== null && local.updated_at >= remotaUpdatedAt) {
      if (maiorUpdatedAt === null || remotaUpdatedAt > maiorUpdatedAt) {
        maiorUpdatedAt = remotaUpdatedAt;
      }
      continue;
    }

    const linha = paraLocal(remota, booleanas);
    linha.updated_at = remotaUpdatedAt;
    // Veio do servidor, logo já está sincronizada: sem isto, o próximo push a devolveria de volta
    // num vaivém infinito.
    linha.synced_at = remotaUpdatedAt;

    const colunas = Object.keys(linha);
    const atribuicoes = colunas
      .filter((coluna) => coluna !== "id")
      .map((coluna) => `${coluna} = excluded.${coluna}`)
      .join(", ");

    await database.runAsync(
      `INSERT INTO ${tabela} (${colunas.join(", ")})
       VALUES (${colunas.map(() => "?").join(", ")})
       ON CONFLICT(id) DO UPDATE SET ${atribuicoes}`,
      colunas.map((coluna) => linha[coluna] as string | number | null),
    );

    recebidos += 1;
    if (maiorUpdatedAt === null || remotaUpdatedAt > maiorUpdatedAt) {
      maiorUpdatedAt = remotaUpdatedAt;
    }
  }

  if (maiorUpdatedAt !== null) await gravarMarcaDagua(tabela, maiorUpdatedAt);
  return recebidos;
}

/** A execução em curso, para duas chamadas não se atropelarem. */
let emAndamento: Promise<ResultadoDaSync> | null = null;

/**
 * Sincroniza tudo: sobe o que mudou aqui, baixa o que mudou lá.
 *
 * **Nunca bloqueia a UI e nunca lança.** Sincronizar é consequência de estar online com conta
 * vinculada, não de uma ação que a pessoa pediu — derrubar uma tela porque o servidor não
 * respondeu trocaria um problema invisível por um visível. O erro é devolvido no resultado, para a
 * UI mostrar se quiser, e a próxima passada tenta de novo.
 *
 * Push antes de pull, sempre. O contrário faria uma edição local ainda não enviada ser sobrescrita
 * pela versão antiga que está no servidor — e o LWW julgaria certo, porque a linha remota seria
 * mesmo mais nova que a última que ele viu subir.
 *
 * Offline-first (§2.9): o app funciona inteiro sem nunca chamar isto. A sincronização é backup e
 * troca entre aparelhos, não caminho crítico de nada.
 */
export async function sincronizar(): Promise<ResultadoDaSync> {
  if (!persistsLocally || supabase === null) {
    return { enviados: 0, recebidos: 0, erro: null };
  }
  // Já rodando: devolve a mesma promessa em vez de disparar uma segunda passada que competiria
  // com a primeira pelas mesmas linhas.
  if (emAndamento !== null) return emAndamento;

  emAndamento = executarSync().finally(() => {
    emAndamento = null;
  });
  return emAndamento;
}

async function executarSync(): Promise<ResultadoDaSync> {
  let enviados = 0;
  let recebidos = 0;

  try {
    const { data } = await supabase!.auth.getUser();
    const userId = data.user?.id;
    // Sem conta vinculada não há para onde sincronizar, e isso não é erro: é o modo em que o app
    // funciona por padrão.
    if (userId === undefined) return { enviados: 0, recebidos: 0, erro: null };

    await garantirTabelaDeControle();

    // Na ordem das dependências: pai antes de filho, para nenhuma linha chegar órfã do outro lado.
    for (const tabela of TABELAS_SINCRONIZAVEIS) {
      enviados += await enviar(tabela, userId);
    }
    for (const tabela of TABELAS_SINCRONIZAVEIS) {
      recebidos += await receber(tabela);
    }

    return { enviados, recebidos, erro: null };
  } catch (cause) {
    console.error("Falha ao sincronizar:", cause);
    return {
      enviados,
      recebidos,
      erro: cause instanceof Error ? cause.message : "Não foi possível sincronizar agora.",
    };
  }
}

/**
 * O que a UI mostra sobre o estado da sincronização.
 *
 * `pendentes` conta as linhas que ainda não subiram. É o número que responde "meus dados estão
 * salvos?" — e ele é honesto mesmo offline, porque sai do banco local.
 */
export async function estadoDaSync(): Promise<EstadoDaSync> {
  if (!persistsLocally || supabase === null) return { ultimaSync: null, pendentes: 0 };

  try {
    await garantirTabelaDeControle();
    const database = getDatabase();

    let pendentes = 0;
    for (const tabela of TABELAS_SINCRONIZAVEIS) {
      const row = await database.getFirstAsync<{ total: number }>(
        `SELECT COUNT(*) AS total FROM ${tabela} WHERE synced_at IS NULL OR updated_at > synced_at`,
      );
      pendentes += row?.total ?? 0;
    }

    // A última sincronização é a marca d'água mais recente entre as tabelas: é o instante até o
    // qual sabemos que o servidor foi consultado.
    const row = await database.getFirstAsync<{ ultima: string | null }>(
      "SELECT MAX(last_pulled_at) AS ultima FROM sync_state",
    );

    return { ultimaSync: row?.ultima ?? null, pendentes };
  } catch {
    return { ultimaSync: null, pendentes: 0 };
  }
}

/**
 * As colunas de caminho de arquivo local, expostas para quem for implementar o E9.
 *
 * Enquanto os anexos não sobem para o Storage, elas viajam como texto e não significam nada no
 * outro aparelho — um `file:///data/user/0/…` do aparelho A não abre no B. Deixar isso explícito
 * aqui é o que evita alguém concluir que o backup de anexos já funciona.
 */
export { COLUNAS_DE_ARQUIVO_LOCAL };
