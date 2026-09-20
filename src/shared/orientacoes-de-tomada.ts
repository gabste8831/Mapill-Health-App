import type { IntakeInstruction } from "@/domain/entities/prescription";

/**
 * Os rótulos da lista fechada de orientações, em português.
 *
 * Moram aqui, e não no formulário que os criou, porque deixaram de ser assunto só do cadastro: a
 * tela do alarme os lê para dizer "em jejum" na hora em que a pergunta acontece. Duplicar o mapa
 * faria as duas telas divergirem no dia em que alguém corrigisse um texto num lugar só.
 */
export const ORIENTACOES_DE_TOMADA: Record<IntakeInstruction, string> = {
  fasting: "Em jejum",
  withMeal: "Junto da refeição",
  afterMeal: "Depois de comer",
  plentyOfWater: "Com bastante água",
  stayUpright: "Não deitar depois",
  avoidAlcohol: "Evitar álcool",
};

/**
 * As orientações marcadas, em texto legível - uma por item.
 *
 * Devolve a **lista**, e não uma frase pronta: na tela do alarme cada orientação vira uma etiqueta
 * com fundo próprio, e isso exige os itens separados. Quem precisar de uma linha só junta com
 * `juntarOrientacoes`.
 *
 * Lista vazia quando nada foi marcado - quem chama decide entre esconder o bloco ou não.
 */
export function formatarOrientacoes(instrucoes: IntakeInstruction[]): string[] {
  return instrucoes.map((instrucao) => ORIENTACOES_DE_TOMADA[instrucao]);
}
