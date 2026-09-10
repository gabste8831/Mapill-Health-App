/**
 * Confere a regra que impede **duas telas de alarme** para o mesmo horário.
 *
 * O defeito, relatado em aparelho em 09/09 e sobrevivente a três correções: o alarme tocava com o
 * som **duplicado**, e ao responder numa tela a outra piscava antes de fechar.
 *
 * A causa é arquitetural. A tela do alarme tem dois pontos de entrada — a Activity que o Notifee
 * monta pelo `fullScreenAction`, e a rota `/alarme/[instante]` que o listener empurra quando o
 * Android rebaixa o full-screen intent. Os dois vivem no **mesmo processo JS** (`index.js` registra
 * o componente nativo e sobe o app inteiro), então um alarme que irrompe com o app rodando aciona
 * os dois caminhos: duas telas, dois players de áudio.
 *
 * Estes casos travam as três regras que resolvem isso, e nenhum deles precisa de aparelho.
 *
 * Rodar: node --experimental-strip-types scripts/conferir-alarme-em-cena.mjs
 */
import {
  entrouEmCena,
  jaEstaEmCena,
  quemEstaEmCena,
  saiuDeCena,
} from "../src/notifications/alarme-em-cena.ts";

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

const HORARIO = "2026-09-09T20:00:00.000Z";
const OUTRO = "2026-09-09T22:00:00.000Z";

console.log("\nO básico: quem está em cena, e quem saiu\n");
{
  conferir("horário sem tela não está em cena", !jaEstaEmCena(HORARIO));
  conferir("e não tem caminho", quemEstaEmCena(HORARIO) === null);

  entrouEmCena(HORARIO, "activity");
  conferir("a Activity entra em cena", jaEstaEmCena(HORARIO));
  conferir("e o caminho é 'activity'", quemEstaEmCena(HORARIO) === "activity");

  saiuDeCena(HORARIO, "activity");
  conferir("e sai quando desmonta", !jaEstaEmCena(HORARIO));
}

console.log("\nA Activity tem precedência sobre a rota\n");
{
  /**
   * O caso que produzia o som duplicado: a Activity sobe pelo `fullScreenAction`, e o listener
   * empurra a rota antes de perceber. Se a rota sobrescrevesse o registro, ela não teria como
   * saber que deve ceder — e as duas ficariam tocando.
   */
  entrouEmCena(HORARIO, "activity");
  entrouEmCena(HORARIO, "rota");
  conferir(
    "a rota NÃO sobrescreve a Activity",
    quemEstaEmCena(HORARIO) === "activity",
    `ficou '${quemEstaEmCena(HORARIO)}'`,
  );

  // E a rota, ao sair, não leva embora o registro da Activity que a fez sair.
  saiuDeCena(HORARIO, "rota");
  conferir(
    "a rota saindo não apaga o registro da Activity",
    quemEstaEmCena(HORARIO) === "activity",
    `ficou '${quemEstaEmCena(HORARIO)}'`,
  );

  saiuDeCena(HORARIO, "activity");
  conferir("a Activity saindo limpa de verdade", quemEstaEmCena(HORARIO) === null);
}

console.log("\nO contrário pode: a Activity chega por cima da rota\n");
{
  // O sistema colocando o alarme na frente de um app em uso. Aí é a rota que sai.
  entrouEmCena(HORARIO, "rota");
  entrouEmCena(HORARIO, "activity");
  conferir(
    "a Activity sobrescreve a rota",
    quemEstaEmCena(HORARIO) === "activity",
    `ficou '${quemEstaEmCena(HORARIO)}'`,
  );
  saiuDeCena(HORARIO, "activity");
}

console.log("\nHorários diferentes não se atrapalham\n");
{
  entrouEmCena(HORARIO, "activity");
  conferir("um horário em cena não afeta o outro", !jaEstaEmCena(OUTRO));

  entrouEmCena(OUTRO, "rota");
  conferir("os dois coexistem", jaEstaEmCena(HORARIO) && jaEstaEmCena(OUTRO));
  conferir("cada um com seu caminho", quemEstaEmCena(OUTRO) === "rota");

  saiuDeCena(HORARIO, "activity");
  conferir("e sair de um não tira o outro", jaEstaEmCena(OUTRO));
  saiuDeCena(OUTRO, "rota");
}

console.log("\nToques repetidos na notificação não empilham telas\n");
{
  /**
   * O caso relatado em aparelho (10/09, passo 14.5.2): o alarme irrompe e deixa a notificação na
   * bandeja (`ongoing: true`, de propósito). Cada toque nela abria **mais uma** tela azul, e
   * responder fechava só a de cima — sobravam as outras, uma por toque.
   *
   * A guarda do listener consulta `jaEstaEmCena` antes de abrir. Estes casos travam a pergunta que
   * ela faz: com tela em cena, o toque não tem o que fazer.
   */
  entrouEmCena(HORARIO, "activity");

  conferir("com a Activity em cena, o toque não abre outra", jaEstaEmCena(HORARIO));
  conferir("e o segundo toque também não", jaEstaEmCena(HORARIO));
  conferir("nem o terceiro", jaEstaEmCena(HORARIO));

  // Depois de a tela sair — respondida —, um toque tardio volta a poder abrir. É o caso de quem
  // responde, a tela fecha, e a notificação ainda está lá.
  saiuDeCena(HORARIO, "activity");
  conferir("mas depois de a tela sair, o toque volta a valer", !jaEstaEmCena(HORARIO));
}

{
  // O mesmo pela rota: ela também registra em cena, então o toque não empilha uma segunda.
  entrouEmCena(HORARIO, "rota");
  conferir("com a rota em cena, o toque não abre outra", jaEstaEmCena(HORARIO));
  saiuDeCena(HORARIO, "rota");
}

console.log("\nO que não pode acontecer\n");
{
  // Sair sem ter entrado não pode explodir nem sujar o registro.
  saiuDeCena("horario-que-nunca-entrou", "rota");
  conferir("sair sem ter entrado é inofensivo", !jaEstaEmCena("horario-que-nunca-entrou"));

  // A mesma tela remontando (o React refaz efeitos em desenvolvimento) não duplica nada.
  entrouEmCena(HORARIO, "rota");
  entrouEmCena(HORARIO, "rota");
  saiuDeCena(HORARIO, "rota");
  conferir("entrar duas vezes e sair uma limpa o registro", !jaEstaEmCena(HORARIO));
}

console.log(`\n${passou} passaram, ${falhou} falharam\n`);
process.exit(falhou > 0 ? 1 : 0);
