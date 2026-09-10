import { File } from "expo-file-system";
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
 * Em lotes para que uma linha ruim derrube só o lote, e não a sincronização inicial inteira.
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
 * A marca d'água do pull mora em `sync_state`, criada pela migration 016. Tabela do banco, e não
 * `AsyncStorage`: ela precisa sumir junto no "apagar tudo", senão o app acha que já baixou dados
 * que não tem mais.
 */

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
 * Colunas que o Postgres tipa como `date` ou `timestamptz`. O SQLite aceita `""` numa coluna de
 * data; o Postgres recusa o lote inteiro com `invalid input syntax for type date: ""`. A conversão
 * fica na borda porque o `""` nasce na apresentação e atravessa o app inteiro.
 */
const COLUNAS_DE_DATA = [
  "date_of_birth",
  "start_date",
  "end_date",
  "attachment_valid_until",
  "scheduled_for",
  "occurred_at",
  "accepted_at",
  "updated_at",
  "deleted_at",
];

function paraRemoto(
  linha: Record<string, unknown>,
  colunasBooleanas: string[],
  colunasOrfas: string[],
  colunasDeArquivo: string[],
): Record<string, unknown> {
  const saida: Record<string, unknown> = {};
  for (const [coluna, valor] of Object.entries(linha)) {
    if ((COLUNAS_LOCAIS as readonly string[]).includes(coluna)) continue;
    // Colunas que a migration seguinte substituiu e o SQLite nunca removeu: enviá-las faz o
    // PostgREST recusar o lote inteiro, porque no servidor elas nunca existiram.
    if (colunasOrfas.includes(coluna)) continue;
    // Caminho de arquivo local sobe como `null`: o arquivo não sobe (E9), então o caminho só vale
    // neste aparelho. `null` e não omitir a coluna, senão o valor antigo fica no servidor.
    if (colunasDeArquivo.includes(coluna)) {
      saida[coluna] = null;
      continue;
    }
    if (colunasBooleanas.includes(coluna)) {
      saida[coluna] = valor === 1 || valor === true;
      continue;
    }
    // Data vazia é ausência de data, e ausência no Postgres é `null`.
    if (valor === "" && COLUNAS_DE_DATA.includes(coluna)) {
      saida[coluna] = null;
      continue;
    }
    // Coluna `jsonb` sobe como objeto: mandar a string do SQLite produz duplo encoding, e na volta
    // o `JSON.parse` do repositório devolve string onde a entidade espera lista. Par simétrico do
    // `JSON.stringify` em `paraLocal`.
    if (COLUNAS_JSON.includes(coluna) && typeof valor === "string") {
      saida[coluna] = interpretarJson(valor);
      continue;
    }
    saida[coluna] = valor;
  }
  return saida;
}

/** `jsonb` no Postgres e `TEXT` no SQLite: listas que só fazem sentido inteiras. */
const COLUNAS_JSON = [
  "allergies",
  "emergency_contacts",
  "schedule",
  "intake_instructions",
];

/**
 * `'["Dipirona"]'` → `["Dipirona"]`. Texto inválido volta como está: uma linha antiga com conteúdo
 * quebrado não pode derrubar a sincronização inteira.
 */
function interpretarJson(texto: string): unknown {
  try {
    return JSON.parse(texto);
  } catch {
    return texto;
  }
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
    if (valor instanceof Date) {
      saida[coluna] = valor.toISOString();
      continue;
    }
    // O PostgREST devolve `jsonb` como objeto, e o expo-sqlite não aceita objeto como parâmetro:
    // sem serializar de volta, o registro falha ou grava algo que o `JSON.parse` não lê. Por tipo e
    // não por lista de colunas, para uma coluna `jsonb` nova ser tratada sozinha.
    if (valor !== null && typeof valor === "object") {
      saida[coluna] = JSON.stringify(valor);
      continue;
    }
    saida[coluna] = valor as string | number | null;
  }
  return saida;
}

/** As colunas booleanas de cada tabela — o SQLite as guarda como 0/1. */
const COLUNAS_BOOLEANAS: Record<TabelaSincronizavel, string[]> = {
  patient_profiles: ["photo_sync_opt_out"],
  consent_records: [],
  medications: ["from_cmed"],
  appointments: ["reminder_on_day"],
  prescriptions: ["attachment_sync_opt_out", "renewal_reminder_enabled"],
  inventory_items: ["low_stock_alert_enabled"],
  dose_schedules: [],
  inventory_adjustments: [],
  intake_logs: [],
};

/**
 * Sobe o que mudou: `synced_at IS NULL OR updated_at > synced_at`. Inclui linha com `deleted_at`,
 * porque a exclusão precisa viajar, senão ela volta do servidor no pull seguinte.
 */
async function enviar(tabela: TabelaSincronizavel, userId: string): Promise<number> {
  const database = getDatabase();
  const pendentes = await database.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM ${tabela} WHERE synced_at IS NULL OR updated_at > synced_at`,
  );
  if (pendentes.length === 0) return 0;

  const booleanas = COLUNAS_BOOLEANAS[tabela];
  const orfas = COLUNAS_ORFAS[tabela] ?? [];
  const arquivos = COLUNAS_DE_ARQUIVO_LOCAL[tabela] ?? [];
  let enviados = 0;

  for (let i = 0; i < pendentes.length; i += TAMANHO_DO_LOTE) {
    const lote = pendentes.slice(i, i + TAMANHO_DO_LOTE);
    const payload = lote.map((linha) => ({
      ...paraRemoto(linha, booleanas, orfas, arquivos),
      user_id: userId,
    }));

    const { error } = await supabase!.from(tabela).upsert(payload, { onConflict: "id" });
    if (error !== null) throw new Error(`${tabela}: ${error.message}`);

    // `synced_at` depois da confirmação do servidor e por linha: carimbar antes marcaria o que
    // talvez não subiu, e a tabela inteira marcaria junto o que mudou durante o envio. Grava o
    // `updated_at` da própria linha, então uma edição feita agora continua pendente.
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
 * Zera o caminho de foto ou anexo cujo arquivo não existe neste aparelho.
 *
 * Os anexos não sobem (E9), mas o caminho sobe: num aparelho novo o app recebia uma string que
 * aponta para nada e acreditava que havia foto. Verifica em vez de limpar sempre porque a
 * sincronização também roda no mesmo aparelho, onde o arquivo está lá.
 */
function limparArquivosInexistentes(
  tabela: TabelaSincronizavel,
  linha: Record<string, unknown>,
): void {
  const colunas = COLUNAS_DE_ARQUIVO_LOCAL[tabela];
  if (colunas === undefined) return;

  for (const coluna of colunas) {
    const caminho = linha[coluna];
    if (typeof caminho !== "string" || caminho.length === 0) continue;

    try {
      if (!new File(caminho).exists) linha[coluna] = null;
    } catch {
      // Caminho malformado (de uma versão antiga, ou de outro sistema de arquivos) também não abre.
      linha[coluna] = null;
    }
  }
}

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

    // LWW por `updated_at`, tudo-ou-nada por registro: local igual ou mais novo vence. Sem merge
    // de campos, que poderia produzir uma posologia que ninguém escreveu. O empate fica com o local
    // porque empate só acontece quando os dois lados já têm a mesma coisa.
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
    limparArquivosInexistentes(tabela, linha);

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
 * Sobe o que mudou aqui, baixa o que mudou lá. Nunca lança: o erro sai no resultado e a próxima
 * passada tenta de novo.
 *
 * Push antes de pull, sempre. O contrário faria uma edição local ainda não enviada ser sobrescrita
 * pela versão antiga do servidor, e o LWW julgaria certo.
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

  // Nada a coordenar com a importação da CMED: ela roda antes de a tela abrir, então não há duas
  // escritas ao mesmo tempo disputando o banco. Ver `use-first-run-gate.ts`.
  try {
    const { data } = await supabase!.auth.getUser();
    const userId = data.user?.id;
    // Sem conta vinculada não há para onde sincronizar, e isso não é erro: é o modo em que o app
    // funciona por padrão.
    if (userId === undefined) return { enviados: 0, recebidos: 0, erro: null };

    // Na ordem das dependências: pai antes de filho, para nenhuma linha chegar órfã do outro lado.
    for (const tabela of TABELAS_SINCRONIZAVEIS) {
      enviados += await enviar(tabela, userId);
    }
    for (const tabela of TABELAS_SINCRONIZAVEIS) {
      recebidos += await receber(tabela);
    }

    /**
     * Desceu tratamento novo: o agendamento vive no sistema operacional, e o Android do aparelho
     * novo não conhece os alarmes do antigo. Sem isto o app reinstalado mostra os remédios e não
     * toca nenhum. Só quando algo desceu, senão reescreveria alarmes idênticos a cada volta.
     *
     * `import` dinâmico para não criar ciclo: `reagendar-avisos` lê os repositórios, que leem o
     * banco importado no topo.
     */
    if (recebidos > 0) {
      const { reagendarTodosOsAvisos } = await import("@/notifications/reagendar-avisos");
      await reagendarTodosOsAvisos();
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

/** `pendentes` conta o que ainda não subiu, e sai do banco local, então é honesto mesmo offline. */
export async function estadoDaSync(): Promise<EstadoDaSync> {
  if (!persistsLocally || supabase === null) return { ultimaSync: null, pendentes: 0 };

  try {
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
 * Exposto para quem for implementar o E9: enquanto os anexos não sobem para o Storage, um
 * `file:///data/user/0/…` do aparelho A não abre no B. O backup de anexos ainda não funciona.
 */
export { COLUNAS_DE_ARQUIVO_LOCAL };
