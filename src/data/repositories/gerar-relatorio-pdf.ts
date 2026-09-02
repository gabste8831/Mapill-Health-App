import { printToFileAsync } from "expo-print";
import { Platform } from "react-native";

import type { Relatorio } from "@/domain/use-cases/montar-relatorio";

/** `2026-09-02T14:32:00.000Z` → `02/09/2026`. */
function dia(data: Date): string {
  const p = (v: number) => String(v).padStart(2, "0");
  return `${p(data.getDate())}/${p(data.getMonth() + 1)}/${data.getFullYear()}`;
}

/** `2026-09-02T14:32:00.000Z` → `02/09/2026 às 14:32`. */
function diaEHora(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (v: number) => String(v).padStart(2, "0");
  return `${dia(d)} às ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** `0.8333` → `83%`. Inteiro: a segunda casa sugere uma precisão que a adesão não tem. */
function percentual(taxa: number): string {
  return `${Math.round(taxa * 100)}%`;
}

/**
 * Escapa o texto do paciente antes de ele virar HTML.
 *
 * Nome de remédio, título de compromisso e nome do titular são **texto livre digitado pela
 * pessoa**. Sem isto, um `&` num nome ("Vitamina A & D") quebraria o documento, e um `<` o
 * truncaria em silêncio — o modo de falhar mais perigoso aqui, porque um PDF que gera sem erro mas
 * perde uma linha de tratamento é pior que um que não gera.
 */
function esc(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function plural(n: number, singular: string, plural_: string): string {
  return `${n} ${n === 1 ? singular : plural_}`;
}

/**
 * O estilo do documento.
 *
 * **Preto sobre branco, sem cor.** O relatório é feito para ser impresso e lido em papel, e a
 * impressora da clínica é preto e branco — cor que vira cinza claro perde a distinção que ela
 * deveria criar. Pela mesma razão não há gráfico: número em texto atravessa qualquer impressão.
 *
 * Tipografia grande (12pt de corpo) porque quem lê pode ser o paciente idoso, e não só o médico.
 */
const ESTILO = `
  @page { margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 12pt; line-height: 1.5; color: #111; margin: 0;
  }
  h1 { font-size: 19pt; margin: 0 0 2mm; letter-spacing: -0.2pt; }
  h2 {
    font-size: 12pt; text-transform: uppercase; letter-spacing: 0.6pt;
    margin: 9mm 0 2.5mm; padding-bottom: 1.5mm; border-bottom: 1.5pt solid #111;
  }
  .cabecalho { border-bottom: 2.5pt solid #111; padding-bottom: 4mm; margin-bottom: 2mm; }
  .meta { font-size: 10.5pt; color: #444; margin: 0.6mm 0; }
  .recorte {
    margin-top: 3mm; padding: 2.5mm 3mm; border: 1pt solid #111;
    font-size: 10.5pt; font-weight: 600;
  }
  table { width: 100%; border-collapse: collapse; margin-top: 1mm; }
  th, td { text-align: left; padding: 2.2mm 2mm; border-bottom: 0.5pt solid #bbb; vertical-align: top; }
  th { font-size: 9.5pt; text-transform: uppercase; letter-spacing: 0.4pt; color: #444; }
  td.numero, th.numero { text-align: right; white-space: nowrap; }
  .taxa { font-size: 30pt; font-weight: 700; line-height: 1.1; margin: 1mm 0; }
  .taxa-detalhe { font-size: 11pt; color: #444; margin-bottom: 2mm; }
  .vazio { color: #444; font-style: italic; }
  .nota { font-size: 10pt; color: #444; margin-top: 2mm; }
  .rodape {
    margin-top: 10mm; padding-top: 3mm; border-top: 0.5pt solid #bbb;
    font-size: 9.5pt; color: #444;
  }
  /* Uma seção não começa no fim da página deixando o título órfão. */
  h2 { break-after: avoid; page-break-after: avoid; }
  tr { break-inside: avoid; page-break-inside: avoid; }
`;

function secaoAdesao(relatorio: Relatorio): string {
  const { adesao } = relatorio;

  // RN20: sem dose vencida não há percentual. "0%" é uma afirmação sobre o comportamento do
  // paciente; ausência de dados não é — e num documento que vai ao médico a diferença importa
  // ainda mais, porque ninguém está lá para explicar.
  if (adesao.taxa === null) {
    return `<h2>Adesão ao tratamento</h2>
      <p class="vazio">Nenhuma dose venceu no período — ainda não há o que medir.</p>`;
  }

  const linhas = adesao.porMedicamento
    .map(
      (item) => `<tr>
        <td>${esc(item.medicationName)}</td>
        <td class="numero">${item.taxa === null ? "—" : percentual(item.taxa)}</td>
        <td class="numero">${item.confirmadas} de ${item.previstas}</td>
      </tr>`,
    )
    .join("");

  return `<h2>Adesão ao tratamento</h2>
    <div class="taxa">${percentual(adesao.taxa)}</div>
    <p class="taxa-detalhe">
      ${plural(adesao.confirmadas, "dose tomada", "doses tomadas")}
      de ${plural(adesao.previstas, "dose prevista", "doses previstas")} no período.
    </p>
    <table>
      <tr><th>Medicamento</th><th class="numero">Adesão</th><th class="numero">Doses</th></tr>
      ${linhas}
    </table>
    <p class="nota">
      Doses ainda não vencidas não entram no cálculo. Uma dose marcada para as 22h não conta
      contra o paciente às 15h.
    </p>`;
}

function secaoTratamentos(relatorio: Relatorio): string {
  if (relatorio.tratamentos.length === 0) {
    return `<h2>Tratamentos em curso</h2>
      <p class="vazio">Nenhum tratamento ativo no período.</p>`;
  }

  const linhas = relatorio.tratamentos
    .map(
      (t) => `<tr>
        <td><strong>${esc(t.nome)}</strong></td>
        <td>${esc(t.dose)}</td>
        <td>${esc(t.frequencia)}</td>
        <td>${t.horarios.length === 0 ? "—" : esc(t.horarios.join(", "))}</td>
      </tr>`,
    )
    .join("");

  return `<h2>Tratamentos em curso</h2>
    <table>
      <tr><th>Medicamento</th><th>Dose</th><th>Frequência</th><th>Horários</th></tr>
      ${linhas}
    </table>`;
}

function secaoPerdas(relatorio: Relatorio): string {
  if (relatorio.perdas.length === 0) {
    return `<h2>Doses não tomadas</h2>
      <p class="vazio">Nenhuma dose deixou de ser tomada no período.</p>`;
  }

  const linhas = relatorio.perdas
    .map(
      (p) => `<tr>
        <td>${esc(p.nome)}</td>
        <td class="numero">${p.puladas}</td>
        <td class="numero">${p.semResposta}</td>
      </tr>`,
    )
    .join("");

  return `<h2>Doses não tomadas</h2>
    <table>
      <tr>
        <th>Medicamento</th>
        <th class="numero">Não tomadas</th>
        <th class="numero">Sem registro</th>
      </tr>
      ${linhas}
    </table>
    <p class="nota">
      <strong>Não tomada</strong> é a dose que o paciente registrou que não tomou.
      <strong>Sem registro</strong> é a dose cujo horário passou sem resposta — o aplicativo não
      presume que ela deixou de ser tomada, apenas que não houve registro.
    </p>`;
}

function secaoCompromissos(relatorio: Relatorio): string {
  if (relatorio.compromissos.length === 0) return "";

  const linhas = relatorio.compromissos
    .map((c) => {
      // RN01 no papel: compromisso passado sem resposta não vira "faltou". O documento diz que não
      // há registro, que é o que de fato se sabe.
      const desfecho =
        c.compareceu === null ? "Sem registro" : c.compareceu ? "Compareceu" : "Não compareceu";
      return `<tr>
        <td>${esc(c.descricao)}</td>
        <td>${esc(diaEHora(c.quando))}</td>
        <td>${desfecho}</td>
      </tr>`;
    })
    .join("");

  return `<h2>Compromissos do período</h2>
    <table>
      <tr><th>Compromisso</th><th>Quando</th><th>Desfecho</th></tr>
      ${linhas}
    </table>`;
}

/**
 * Exportado para poder ser verificado sem aparelho: é HTML puro a partir de um objeto puro, então
 * roda em Node. A alternativa seria descobrir um `&` escapado errado só quando o PDF saísse
 * truncado na mão do médico.
 */
export function montarHtml(relatorio: Relatorio): string {
  const recorte = relatorio.recorte
    ? `<p class="recorte">
         Este relatório cobre ${relatorio.recorte.selecionados} de
         ${relatorio.recorte.total} tratamentos — não o tratamento completo do paciente.
       </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8" /><style>${ESTILO}</style></head>
<body>
  <div class="cabecalho">
    <h1>${esc(relatorio.paciente)}</h1>
    <p class="meta">
      Período: ${dia(relatorio.inicio)} a ${dia(relatorio.fim)}
    </p>
    <p class="meta">Emitido em ${dia(relatorio.fim)} pelo aplicativo Mapill</p>
  </div>
  ${recorte}
  ${secaoTratamentos(relatorio)}
  ${secaoAdesao(relatorio)}
  ${secaoPerdas(relatorio)}
  ${secaoCompromissos(relatorio)}
  <p class="rodape">
    Documento gerado a partir dos registros feitos pelo próprio paciente no aplicativo Mapill.
    Não substitui avaliação clínica nem constitui prescrição.
  </p>
</body>
</html>`;
}

export type RelatorioGerado = {
  /** Caminho do PDF, pronto para ser compartilhado. */
  uri: string;
  /** Nome legível, com a data — é o que a pessoa vê ao salvar. */
  nome: string;
};

/**
 * Gera o PDF do relatório clínico.
 *
 * **Por que PDF e não outra coisa.** A exportação em JSON do D3 cumpre o direito de portabilidade
 * (LGPD art. 18, II e V) e é ilegível para um médico; este arquivo é o oposto — não se importa em
 * lugar nenhum, e se lê em qualquer lugar. Os dois não competem: um é a saída para máquina, o
 * outro para humano. É também o único artefato do app que existe **fora** do celular, e continua
 * servindo com o aparelho descarregado na sala de espera.
 *
 * Tudo local: o HTML é montado aqui e o `expo-print` o renderiza no próprio aparelho. Nenhum dado
 * clínico sai para serviço nenhum para o arquivo existir (§2.8, offline-first).
 */
export async function gerarRelatorioPdf(relatorio: Relatorio): Promise<RelatorioGerado> {
  if (Platform.OS === "web") {
    throw new Error("O relatório em PDF está disponível apenas no aplicativo.");
  }

  const { uri } = await printToFileAsync({ html: montarHtml(relatorio), base64: false });

  const p = (v: number) => String(v).padStart(2, "0");
  const d = relatorio.fim;
  const nome = `mapill-relatorio-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.pdf`;

  // O `expo-print` já grava em cache com nome aleatório, e é onde este arquivo deve ficar: ele
  // existe para sair do app, não para acumular cópias de dado sensível no diretório de documentos.
  // O nome legível vai junto para a folha de compartilhamento nomear o anexo.
  return { uri, nome };
}
