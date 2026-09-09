/**
 * Confere para onde o toque em cada aviso leva.
 *
 * A regra lê o **prefixo da chave** que o planejador montou, e é aí que ela pode quebrar em
 * silêncio: renomear uma chave em `planejar-avisos-de-estoque` ou `planejar-avisos-de-compromisso`
 * e esquecer daqui faria o toque voltar a cair na Home, sem erro nenhum. Estes casos amarram os
 * dois lados — se um sufixo mudar lá, um destes falha.
 *
 * Rodar: node --experimental-strip-types scripts/conferir-destino-do-aviso.mjs
 */
import { destinoDaChave } from "../src/notifications/destino-do-aviso.ts";

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

console.log("\nCada aviso leva onde o assunto se resolve\n");
{
  const baixo = destinoDaChave("estoque-inv-1-baixo");
  conferir("estoque acabando → tela de estoque", baixo?.tela === "estoque");

  const acabou = destinoDaChave("estoque-inv-1-acabou");
  conferir("estoque acabou → tela de estoque", acabou?.tela === "estoque");

  const antes = destinoDaChave("receita-presc-9-antes");
  conferir("receita vencendo → cadastro do remédio", antes?.tela === "medicamento");
  conferir(
    "e leva o id da prescrição, sem o sufixo",
    antes?.tela === "medicamento" && antes.prescriptionId === "presc-9",
    antes?.tela === "medicamento" ? antes.prescriptionId : "não é medicamento",
  );

  const noDia = destinoDaChave("receita-presc-9-no-dia");
  conferir(
    "receita vence hoje → mesmo destino",
    noDia?.tela === "medicamento" && noDia.prescriptionId === "presc-9",
  );

  const compromisso = destinoDaChave("compromisso-ap-3-no-dia");
  conferir(
    "compromisso → lista com o detalhe aberto",
    compromisso?.tela === "compromissos" && compromisso.appointmentId === "ap-3",
    compromisso?.tela === "compromissos" ? compromisso.appointmentId : "não é compromissos",
  );
}

console.log("\nO aviso de dose não tem destino próprio\n");
{
  // Dose é o caminho antigo: ela abre a tela do horário ou a do alarme, e quem decide isso é o
  // listener. Devolver um destino aqui faria o toque navegar e **não** registrar a dose.
  conferir("dose não produz destino", destinoDaChave("dose-2026-09-09T08:00") === null);
  conferir("adiado não produz destino", destinoDaChave("adiado-abc") === null);
  conferir("chave vazia não produz destino", destinoDaChave("") === null);
}

console.log("\nIds com hífen sobrevivem\n");
{
  /**
   * Os ids são UUID, que têm hífen — e o sufixo é removido por âncora de fim (`$`), não por corte
   * no primeiro hífen. Se alguém trocar para `split("-")`, este caso quebra.
   */
  const uuid = "3f2504e0-4f89-11d3-9a0c-0305e82c3301";
  const destino = destinoDaChave(`receita-${uuid}-antes`);
  conferir(
    "UUID inteiro chega ao destino",
    destino?.tela === "medicamento" && destino.prescriptionId === uuid,
    destino?.tela === "medicamento" ? destino.prescriptionId : "não é medicamento",
  );

  // "no-dia" tem hífen dentro: o padrão precisa casar o sufixo inteiro, não só "-dia".
  const comNoDia = destinoDaChave(`compromisso-${uuid}-no-dia`);
  conferir(
    "sufixo 'no-dia' sai inteiro",
    comNoDia?.tela === "compromissos" && comNoDia.appointmentId === uuid,
    comNoDia?.tela === "compromissos" ? comNoDia.appointmentId : "não é compromissos",
  );
}

console.log(`\n${passou} passaram, ${falhou} falharam\n`);
process.exit(falhou > 0 ? 1 : 0);
