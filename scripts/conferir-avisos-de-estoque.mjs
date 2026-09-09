/**
 * Confere a regra do aviso de estoque acabando.
 *
 * O que estes casos travam é a diferença entre o estoque e os outros avisos do app: a validade de
 * uma receita é uma data fixa, mas a previsão de estoque é recalculada a cada dose confirmada e a
 * cada recontagem. Sem a trava, um estoque baixo geraria uma notificação nova a cada toque em
 * "confirmar" — o caminho mais curto para a pessoa desligar as notificações do app e perder junto
 * os alarmes de dose.
 *
 * Rodar: node --experimental-strip-types scripts/conferir-avisos-de-estoque.mjs
 */
import { planejarAvisosDeEstoque } from "../src/domain/use-cases/planejar-avisos-de-estoque.ts";

let passou = 0;
let falhou = 0;

function conferir(descricao, condicao, detalhe) {
  if (condicao) {
    passou += 1;
    console.log(`  ok  ${descricao}`);
  } else {
    falhou += 1;
    console.error(`FALHOU  ${descricao}${detalhe ? ` — ${detalhe}` : ""}`);
  }
}

/** 01/09/2026, 10h — a janela vai até 30 dias depois, como a dos outros avisos. */
const AGORA = new Date(2026, 8, 1, 10, 0);
const ATE = new Date(2026, 9, 1, 10, 0);

function planejar(estoques) {
  return planejarAvisosDeEstoque({ estoques, agora: AGORA, ate: ATE });
}

function estoque(extra) {
  return {
    inventoryId: "e1",
    medicationName: "Losartana",
    diasRestantes: 10,
    ultimoDia: "2026-09-11",
    avisoLeadDays: 7,
    quantidadeQuandoAvisou: null,
    quantidadeAtual: 20,
    ...extra,
  };
}

console.log("\nQuando o aviso é planejado\n");
{
  // Dura 10 dias, quer aviso com 7 de antecedência: o aviso cai daqui a 3 dias.
  const avisos = planejar([estoque()]);
  const baixo = avisos.find((a) => a.chave.endsWith("-baixo"));
  conferir("entra na janela no dia certo", baixo !== undefined && baixo.quando.getDate() === 4);
  conferir("e às 00:01, como os outros avisos", baixo !== undefined && baixo.quando.getHours() === 0 && baixo.quando.getMinutes() === 1);

  const acabou = avisos.find((a) => a.chave.endsWith("-acabou"));
  conferir("o fim do estoque tem aviso próprio", acabou !== undefined && acabou.quando.getDate() === 11);

  conferir("nenhum é alarme — estoque não interrompe", avisos.every((a) => a.modo === "notification"));
  conferir("nenhum tem ação rápida — não há dose a responder", avisos.every((a) => a.semAcoesRapidas === true));
  conferir("nenhum carrega dose vinculada", avisos.every((a) => a.doseScheduleIds.length === 0));
}

console.log("\nQuem não pediu aviso não recebe\n");
{
  conferir("sem antecedência pedida, nenhum aviso", planejar([estoque({ avisoLeadDays: null })]).length === 0);
}

console.log("\nA trava: avisado uma vez, calado até haver reposição\n");
{
  // Já avisou quando havia 20, e a caixa segue com 20 (ou menos, porque doses foram tomadas).
  conferir(
    "mesma quantidade não avisa de novo",
    planejar([estoque({ quantidadeQuandoAvisou: 20, quantidadeAtual: 20 })]).length === 0,
  );
  conferir(
    "consumir mais não rearma — é a mesma queda já avisada",
    planejar([estoque({ quantidadeQuandoAvisou: 20, quantidadeAtual: 12 })]).length === 0,
  );
  conferir(
    "repor rearma o aviso",
    planejar([estoque({ quantidadeQuandoAvisou: 20, quantidadeAtual: 60 })]).length > 0,
  );
}

console.log("\nO que não pode acontecer\n");
{
  // Antecedência maior que o estoque: os dois avisos cairiam no mesmo dia (hoje já está dentro
  // da janela), e duas notificações iguais no mesmo minuto leem como defeito.
  const avisos = planejar([estoque({ diasRestantes: 3, avisoLeadDays: 30 })]);
  const dias = avisos.map((a) => a.quando.getTime());
  conferir("nunca dois avisos no mesmo instante", new Set(dias).size === dias.length);

  // Estoque que dura mais que a janela de agendamento: não há o que agendar ainda.
  conferir(
    "além da janela não agenda",
    planejar([estoque({ diasRestantes: 200, avisoLeadDays: 7 })]).length === 0,
  );

  // O aviso do passado não existe: quem já deixou o estoque acabar não recebe notificação de
  // um dia que passou — o cartão vermelho da Home é quem conta essa história.
  conferir(
    "estoque já zerado não gera aviso retroativo",
    planejar([estoque({ diasRestantes: 0, avisoLeadDays: 7 })]).length === 0,
  );
}

console.log(`\n${passou} passaram, ${falhou} falharam\n`);
process.exit(falhou > 0 ? 1 : 0);
