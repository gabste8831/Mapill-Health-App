/**
 * Confere o conteúdo do relatório clínico em PDF, sem aparelho.
 *
 * **Por que existe.** O relatório é um documento que sai do app e vai para a mão de outra pessoa —
 * é o único artefato do Mapill que existe fora do celular. Um erro aqui não aparece como tela
 * quebrada: aparece como um número errado numa consulta, ou como um PDF truncado que ninguém
 * percebe estar faltando uma linha de tratamento.
 *
 * Duas coisas são verificadas, e as duas são puras:
 *
 * 1. `montarRelatorio` — o conteúdo. Agrupamento das perdas, corte das doses futuras, e a
 *    declaração do recorte quando o relatório é filtrado por medicamento.
 * 2. `montarHtml` — o documento. Escape do texto digitado pelo paciente (um `&` num nome de
 *    remédio truncaria o PDF em silêncio) e as regras que o papel precisa respeitar: RN20 (sem
 *    dose vencida não há percentual) e RN01 (compromisso sem resposta não vira "faltou").
 *
 * Rodar após mexer no relatório ou nas regras de adesão:
 *
 *     node scripts/conferir-relatorio.mjs
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const raiz = path.resolve(import.meta.dirname, "..");
const saida = mkdtempSync(path.join(tmpdir(), "mapill-relatorio-"));

let ok = 0;
let falhou = 0;

function checar(nome, condicao, detalhe) {
  if (condicao) {
    ok += 1;
  } else {
    falhou += 1;
    console.log(`FALHA  ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
  }
}

try {
  // O gerador importa `expo-print` e `react-native`, que não existem em Node. Como aqui só
  // interessa o HTML — string a partir de objeto —, substituímos os dois por dublês.
  const modulos = path.join(saida, "node_modules");
  mkdirSync(path.join(modulos, "expo-print"), { recursive: true });
  mkdirSync(path.join(modulos, "react-native"), { recursive: true });
  writeFileSync(
    path.join(modulos, "expo-print", "index.js"),
    'exports.printToFileAsync = async () => ({ uri: "file:///fake.pdf" });\n',
  );
  writeFileSync(
    path.join(modulos, "react-native", "index.js"),
    'exports.Platform = { OS: "android" };\n',
  );
  for (const pacote of ["expo-print", "react-native"]) {
    writeFileSync(
      path.join(modulos, pacote, "package.json"),
      JSON.stringify({ name: pacote, main: "index.js" }),
    );
    // Os tipos não existem nos dublês, e `skipLibCheck` não cobre módulo ausente.
    writeFileSync(
      path.join(modulos, pacote, "index.d.ts"),
      pacote === "expo-print"
        ? "export declare function printToFileAsync(options: unknown): Promise<{ uri: string }>;\n"
        : "export declare const Platform: { OS: string };\n",
    );
  }

  // `--ignoreConfig` descarta o tsconfig do projeto — e com ele o alias `@/`. Um tsconfig próprio
  // devolve só o que a compilação precisa, sem arrastar as opções de React Native.
  const configuracao = path.join(saida, "tsconfig.json");
  writeFileSync(
    configuracao,
    JSON.stringify({
      compilerOptions: {
        outDir: saida,
        // CommonJS: o ESM do Node exige a extensão `.js` nos imports relativos, e o TS não a
        // acrescenta ao emitir. Aqui o formato não importa — só o resultado das funções.
        module: "commonjs",
        moduleResolution: "node10",
        ignoreDeprecations: "6.0",
        target: "es2022",
        skipLibCheck: true,
        rootDir: path.join(raiz, "src"),
        // Caminho absoluto em vez de `baseUrl` + relativo: `baseUrl` está deprecado no TS 6.
        paths: { "@/*": [path.join(raiz, "src/*")] },
      },
      files: [
        path.join(raiz, "src/domain/use-cases/montar-relatorio.ts"),
        path.join(raiz, "src/data/repositories/gerar-relatorio-pdf.ts"),
      ],
    }),
  );

  try {
    execFileSync("npx", ["tsc", "--project", configuracao], {
      cwd: raiz,
      stdio: "pipe",
      shell: process.platform === "win32",
    });
  } catch (erro) {
    // A saída do tsc vem em `stdout`, não em `stderr` — sem isto o erro chega como um Buffer de
    // bytes, que não diz nada a quem rodou o script.
    console.error("A compilação falhou:\n");
    console.error(String(erro.stdout ?? erro.message));
    process.exit(1);
  }

  // O `--outDir` preserva a estrutura a partir da raiz comum de `src/`.
  const importar = async (relativo) =>
    import(pathToFileURL(path.join(saida, relativo)).href);

  const { montarRelatorio } = await importar("domain/use-cases/montar-relatorio.js");
  const { montarHtml } = await importar("data/repositories/gerar-relatorio-pdf.js");

  const AGORA = new Date("2026-09-02T15:00:00.000Z");
  const INICIO = new Date("2026-08-03T15:00:00.000Z");

  const dose = (id, med, nome, quando, status) => ({
    doseScheduleId: id,
    scheduledFor: quando,
    medicationId: med,
    medicationName: nome,
    latestStatus: status,
  });

  const base = (extra) => ({
    doses: [],
    tratamentos: [],
    compromissos: [],
    paciente: "Maria",
    inicio: INICIO,
    agora: AGORA,
    totalDeTratamentos: 0,
    ...extra,
  });

  // ------------------------------------------------------------------ conteúdo

  // Dose futura não conta: ela ainda pode ser tomada, e contá-la faria o relatório piorar sozinho
  // ao longo do dia.
  {
    const r = montarRelatorio(
      base({ doses: [dose("d1", "m1", "Losartana", "2026-09-02T22:00:00.000Z", null)] }),
    );
    checar("dose futura não gera taxa", r.adesao.taxa === null, `taxa=${r.adesao.taxa}`);
    checar("dose futura não vira perda", r.perdas.length === 0);
  }

  // As perdas vêm contadas por medicamento, e pulada continua distinta de sem resposta: "decidi
  // não tomar" e "esqueci" pedem condutas opostas na consulta.
  {
    const r = montarRelatorio(
      base({
        doses: [
          dose("d1", "m1", "Losartana", "2026-09-01T08:00:00.000Z", "skipped"),
          dose("d2", "m1", "Losartana", "2026-09-01T20:00:00.000Z", null),
          dose("d3", "m1", "Losartana", "2026-08-31T08:00:00.000Z", "confirmed"),
        ],
      }),
    );
    checar("uma linha por medicamento", r.perdas.length === 1, `n=${r.perdas.length}`);
    checar("pulada e sem resposta separadas",
      r.perdas[0].puladas === 1 && r.perdas[0].semResposta === 1);
    checar("confirmada não vira perda", r.perdas[0].puladas + r.perdas[0].semResposta === 2);
  }

  // `deferred` é "vi e resolvo depois" — informação sobre o alarme, não sobre a dose.
  {
    const r = montarRelatorio(
      base({ doses: [dose("d1", "m1", "Losartana", "2026-09-01T08:00:00.000Z", "deferred")] }),
    );
    checar("deferred conta como sem resposta",
      r.perdas[0].semResposta === 1 && r.perdas[0].puladas === 0);
  }

  {
    const r = montarRelatorio(
      base({
        doses: [
          dose("a1", "m1", "Aspirina", "2026-09-01T08:00:00.000Z", "skipped"),
          dose("b1", "m2", "Metformina", "2026-09-01T08:00:00.000Z", "skipped"),
          dose("b2", "m2", "Metformina", "2026-09-01T12:00:00.000Z", "skipped"),
        ],
      }),
    );
    checar("quem mais perdeu vem primeiro", r.perdas[0].nome === "Metformina");
  }

  // Empate pelo nome, para a ordem não dançar entre duas gerações do mesmo período.
  {
    const r = montarRelatorio(
      base({
        doses: [
          dose("z1", "m2", "Zolpidem", "2026-09-01T08:00:00.000Z", "skipped"),
          dose("a1", "m1", "Aspirina", "2026-09-01T08:00:00.000Z", "skipped"),
        ],
      }),
    );
    checar("empate desempata pelo nome", r.perdas[0].nome === "Aspirina");
  }

  // O recorte é o que impede o documento de afirmar mais do que os dados sustentam.
  {
    const t = (id, nome) => ({
      medicationId: id,
      nome,
      dose: "1 comprimido",
      frequencia: "Todo dia",
      horarios: [],
    });

    const completo = montarRelatorio(
      base({ tratamentos: [t("m1", "A"), t("m2", "B")], totalDeTratamentos: 2 }),
    );
    checar("sem filtro não declara recorte", completo.recorte === null);

    const filtrado = montarRelatorio(base({ tratamentos: [t("m1", "A")], totalDeTratamentos: 5 }));
    checar("filtrado declara o recorte",
      filtrado.recorte?.selecionados === 1 && filtrado.recorte?.total === 5,
      JSON.stringify(filtrado.recorte));

    // App vazio não é "filtrado": declarar "0 de 0" seria ruído num relatório já vazio.
    checar("app vazio não declara recorte",
      montarRelatorio(base({ tratamentos: [], totalDeTratamentos: 0 })).recorte === null);
  }

  {
    const r = montarRelatorio(
      base({
        doses: [
          dose("d1", "m1", "Losartana", "2026-09-01T08:00:00.000Z", "confirmed"),
          dose("d2", "m1", "Losartana", "2026-09-01T20:00:00.000Z", "skipped"),
          dose("d3", "m1", "Losartana", "2026-09-02T22:00:00.000Z", null),
        ],
      }),
    );
    checar("futura fora do denominador", r.adesao.previstas === 2);
    checar("taxa é confirmadas ÷ previstas", r.adesao.taxa === 0.5, `taxa=${r.adesao.taxa}`);
  }

  // -------------------------------------------------------------------- o papel

  const relatorio = {
    paciente: "Maria Silva",
    inicio: INICIO,
    fim: AGORA,
    adesao: {
      previstas: 60,
      confirmadas: 51,
      puladas: 5,
      semResposta: 4,
      taxa: 0.85,
      porMedicamento: [
        { medicationId: "m1", medicationName: "Metformina", previstas: 30, confirmadas: 24, puladas: 4, semResposta: 2, taxa: 0.8 },
        { medicationId: "m2", medicationName: "Losartana", previstas: 30, confirmadas: 27, puladas: 1, semResposta: 2, taxa: 0.9 },
      ],
    },
    tratamentos: [
      { medicationId: "m1", nome: "Metformina 850mg", dose: "1 comprimido", frequencia: "Todo dia", horarios: ["08:00", "20:00"] },
    ],
    compromissos: [
      { descricao: "Consulta com cardiologista", quando: "2026-08-20T14:00:00.000Z", compareceu: true },
      { descricao: "Coleta de sangue", quando: "2026-08-28T09:00:00.000Z", compareceu: null },
    ],
    perdas: [
      { nome: "Metformina", puladas: 4, semResposta: 2 },
      { nome: "Losartana", puladas: 1, semResposta: 2 },
    ],
    recorte: null,
  };

  {
    const html = montarHtml(relatorio);
    checar("documento bem formado",
      html.startsWith("<!DOCTYPE html>") && html.trim().endsWith("</html>"));
    checar("cabeçalho traz paciente e período",
      html.includes("Maria Silva") && html.includes("03/08/2026") && html.includes("02/09/2026"));
    checar("taxa em inteiro", html.includes("85%"));

    // Tabela aberta e não fechada produz PDF truncado — e truncado em silêncio.
    const abre = (html.match(/<table/g) ?? []).length;
    const fecha = (html.match(/<\/table>/g) ?? []).length;
    checar("tabelas balanceadas", abre === fecha, `${abre} abertas, ${fecha} fechadas`);

    // RN01 no papel: compromisso passado sem resposta não vira "faltou".
    checar("compromisso sem resposta não vira falta",
      html.includes("Sem registro") && !html.includes("Não compareceu"));
  }

  // O escape é o defeito mais perigoso aqui: um `<` num nome trunca o documento sem erro nenhum.
  {
    const html = montarHtml({
      ...relatorio,
      paciente: 'Maria <script>alert("x")</script> & Silva',
      tratamentos: [
        { medicationId: "m1", nome: "Vitamina A & D <b>", dose: "1 gota", frequencia: "Todo dia", horarios: [] },
      ],
    });
    checar("escapa marcação do nome do paciente", !html.includes("<script>"));
    checar("escapa & do nome do medicamento", html.includes("Vitamina A &amp; D"));
    checar("escapa < do nome do medicamento", !html.includes("D <b>"));
  }

  // RN20: zero por cento é uma afirmação sobre o paciente; ausência de dados não é.
  {
    const html = montarHtml({
      ...relatorio,
      adesao: { previstas: 0, confirmadas: 0, puladas: 0, semResposta: 0, taxa: null, porMedicamento: [] },
      perdas: [],
    });
    checar("sem dose vencida diz que não há o que medir",
      html.includes("ainda não há o que medir"));
    // Só o corpo: o `width: 100%` do CSS contém "0%" e daria falso positivo.
    const corpo = html.slice(html.indexOf("<body"));
    checar("sem dose vencida não escreve 0%", !/\b0%/.test(corpo));
  }

  {
    const html = montarHtml({ ...relatorio, recorte: { selecionados: 2, total: 5 } });
    checar("recorte aparece no documento",
      html.includes("não o tratamento completo do paciente"));
    checar("sem recorte o aviso não aparece",
      !montarHtml(relatorio).includes("não o tratamento completo"));
  }

  // Decisão 6.4 aplicada ao papel: perdas contadas, nunca uma linha por dose.
  {
    const corrido = montarHtml(relatorio).replace(/\s+/g, " ");
    checar("explica o que é 'sem registro'",
      corrido.includes("o aplicativo não presume que ela deixou de ser tomada"));
    checar("distingue não tomada de sem registro",
      corrido.includes("<strong>Não tomada</strong>") &&
        corrido.includes("<strong>Sem registro</strong>"));
  }

  // Título órfão de seção vazia é ruído num documento que se quer curto.
  {
    checar("seção de compromissos some quando vazia",
      !montarHtml({ ...relatorio, compromissos: [] }).includes("Compromissos do período"));
  }
} finally {
  rmSync(saida, { recursive: true, force: true });
}

console.log(`\n${ok} verificações passaram, ${falhou} falharam.`);
process.exit(falhou === 0 ? 0 : 1);
