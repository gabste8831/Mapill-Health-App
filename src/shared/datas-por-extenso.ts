/**
 * Datas escritas como se fala. Fica fora das telas porque a Home e a agenda dizem a mesma data:
 * com uma tabela de meses em cada arquivo, "27 de agosto" viraria "27 de Agosto" num dos dois e
 * nada no código denunciaria.
 */

const DIAS_DA_SEMANA = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function comInicialMaiuscula(texto: string): string {
  return `${texto[0].toUpperCase()}${texto.slice(1)}`;
}

/** "Segunda-feira, 12 de maio" — com a inicial maiúscula, que é como um título se escreve. */
export function dataPorExtenso(date: Date): string {
  return `${comInicialMaiuscula(DIAS_DA_SEMANA[date.getDay()])}, ${date.getDate()} de ${MESES[date.getMonth()]}`;
}

/**
 * "Quarta-feira, 27 de agosto, às 14:30" — a confirmação de um compromisso.
 *
 * Diz o **dia da semana** junto da data porque é ele que a pessoa confere: "dia 27" não denuncia
 * nada, mas "sábado" denuncia na hora quem quis marcar na sexta e errou o número.
 */
export function dataEHoraPorExtenso(date: Date): string {
  const horas = String(date.getHours()).padStart(2, "0");
  const minutos = String(date.getMinutes()).padStart(2, "0");
  return `${dataPorExtenso(date)}, às ${horas}:${minutos}`;
}

/** "27/08" — curto, para lista onde o ano é quase sempre o corrente. */
export function diaEMesCurto(date: Date): string {
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}`;
}
