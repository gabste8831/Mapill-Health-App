
import { estilosDoTema, radius } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  base: {
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  /**
   * Mesma altura do `TextField` (52), para o botão ao lado de um campo não ficar mais baixo que
   * ele — era o desalinhamento que motivou este tamanho.
   */
  md: {
    width: 52,
    height: 52,
  },
  /**
   * O alvo de dentro de um cartão de lista. 44 e não 40: é o mínimo de toque do projeto, e estes
   * botões ficam **encostados num destrutivo** (editar ao lado de excluir), onde errar o toque
   * apaga um tratamento.
   */
  sm: {
    width: 44,
    height: 44,
  },
  primary: {
    backgroundColor: cores.primary,
  },
  outline: {
    backgroundColor: cores.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: cores.outlineVariant,
  },
  /** Sem borda: dentro de um cartão, o contorno de 1px devolveria o aspecto de planilha. */
  sutil: {
    backgroundColor: cores.surfaceContainerLow,
  },
  disabled: {
    opacity: 0.4,
  },
}));
