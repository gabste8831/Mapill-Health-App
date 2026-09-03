import { colors } from "../colors";
import type { Tema } from "./tipos";

/**
 * O tema do Mapill — o visual próprio do app, e o padrão para todo mundo.
 *
 * Ele **é** a paleta de `shared/theme/colors.ts`, sem cópia: azul focal sobre fundo claro levemente
 * azulado, sombra no lugar de borda, cor usada só quando tem função. Os outros três temas são
 * alternativas de acessibilidade que partem daqui — nenhum deles é "o app redesenhado", todos
 * preservam esta mesma estrutura e mudam só o necessário.
 */
export const temaPadrao: Tema = {
  id: "padrao",
  nome: "Padrão",
  descricao: "O visual do Mapill: azul sobre fundo claro.",
  esquema: "claro",
  cores: colors,
  ajustes: {
    contornarSuperficies: false,
    reforcarFormaEIcone: false,
    textoDeApoioMaisForte: false,
  },
};
