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
 * Junta as orientações marcadas numa frase só, para caber numa linha da tela do alarme.
 *
 * O separador é `·` e não vírgula: são itens independentes de uma lista, não uma enumeração — e o
 * ponto médio se lê mais rápido de madrugada, que é quando esta linha importa.
 *
 * Devolve `null` quando nada foi marcado, para quem chama decidir entre esconder a linha ou não —
 * string vazia renderizaria um espaço em branco com altura de texto.
 */
export function formatarOrientacoes(instrucoes: IntakeInstruction[]): string | null {
  if (instrucoes.length === 0) return null;
  return instrucoes.map((instrucao) => ORIENTACOES_DE_TOMADA[instrucao]).join(" · ");
}
