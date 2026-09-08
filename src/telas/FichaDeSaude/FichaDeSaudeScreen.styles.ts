
import { estilosDoTema, fieldLabelGap, radius, spacing, typography } from "@/shared/theme";

/**
 * O lado do quadro da foto, em uma constante só.
 *
 * O quadro e a imagem dentro dele precisam da **mesma** medida, e a imagem a usa como número
 * fixo em vez de `100%` — ver `photo`. Dois literais iguais em lugares diferentes é o tipo de
 * coisa que diverge na primeira vez que alguém ajusta um deles.
 */
const TAMANHO_DA_FOTO = 72;

export const criarEstilos = estilosDoTema(({ cores }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    flexGrow: 1,
    // `flexGrow: 1` faz o conteúdo ocupar pelo menos a altura da tela; `justifyContent: "center"`
    // só tem efeito nesse caso (conteúdo mais curto que a tela) — se o formulário crescer (ex:
    // mais campos, teclado aberto), o ScrollView volta a rolar normalmente sem quebrar isso.
    justifyContent: "center",
    padding: spacing.md,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: cores.onSurface,
  },
  /**
   * As duas seções são marcadas, não só a obrigatória: o contraste entre "obrigatório" e
   * "opcional" comunica mais rápido do que destacar uma sozinha. Em texto, e não só em cor —
   * cor sozinha não é sinal legível pra quem não a distingue.
   */
  selo: {
    ...typography.caption,
    overflow: "hidden",
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    // paddingVertical: 2,
  },
  seloObrigatorio: {
    backgroundColor: cores.primary,
    color: cores.onPrimary,
  },
  seloOpcional: {
    backgroundColor: cores.surfaceContainerHigh,
    color: cores.onSurfaceVariant,
  },
  sectionHint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  footerHint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
  },
  subtitle: {
    ...typography.bodySm,
    color: cores.outline,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: cores.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  infoBannerText: {
    // `bodyMd` inteiro: o 13 era um meio-termo entre dois degraus da escala, sem razão registrada.
    ...typography.bodyMd,
    color: cores.onPrimaryContainer,
    flex: 1,
    padding: spacing.sm,
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  /**
   * O quadro da foto, **igual com e sem imagem**.
   *
   * Antes eram dois estilos trocados no lugar (`photoPlaceholder` → `photoFrame`), e a diferença
   * entre eles não era só decorativa: um tinha borda tracejada e centralizava o ícone, o outro
   * ligava `overflow: "hidden"` para recortar a imagem no círculo. Trocar de um para o outro
   * recriava o contêiner no mesmo instante em que a `Image` montava — e no Android o recorte
   * chegava depois do primeiro paint, deixando a foto pintada fora da área visível do pai.
   *
   * O sintoma era preciso: a **primeira** foto ficava branca, e trocar uma já existente
   * funcionava. Trocar mantém `photoFrame` nos dois renders; estrear muda de estilo.
   *
   * Com uma base só — mesma medida, mesmo raio, `overflow` sempre ligado — o quadro deixa de ter
   * dois estados de layout. O que muda é a borda, que é pintura e não geometria.
   */
  photoQuadro: {
    width: TAMANHO_DA_FOTO,
    height: TAMANHO_DA_FOTO,
    borderRadius: radius.full,
    overflow: "hidden",
    backgroundColor: cores.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  /** Só a borda tracejada do quadro vazio: convida ao toque sem alterar a caixa. */
  photoVazio: {
    borderWidth: 1,
    borderColor: cores.outlineVariant,
    borderStyle: "dashed",
  },
  /**
   * O alvo de toque dentro do quadro: preenche a caixa que a `View` de fora já mediu.
   *
   * Ele não define medida própria de propósito — quem carrega os 72px é `photoQuadro`, e foi
   * justamente um `Pressable` **sendo** o quadro que produziu o defeito da miniatura invisível.
   */
  photoToque: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  /** O escurecer do toque, que antes vinha de `estadoDePressao`. */
  photoPressionada: {
    opacity: 0.85,
  },
  /**
   * Medida **fixa**, e não `100%` do pai.
   *
   * O percentual obriga a imagem a resolver contra a caixa de quem a contém, e este quadro trocou
   * de anatomia mais de uma vez enquanto o defeito era caçado. Com número fixo a imagem não
   * depende de ninguém ter resolvido nada — e `TAMANHO_DA_FOTO` é o mesmo de `photoQuadro`,
   * escrito uma vez para os dois não poderem divergir.
   */
  photo: {
    width: TAMANHO_DA_FOTO,
    height: TAMANHO_DA_FOTO,
  },
  /**
   * O alvo em volta dos links de foto ("Trocar foto", "Remover").
   *
   * O texto sozinho tinha a altura da própria linha — perto de 20px, menos da metade dos 44 que um
   * alvo de dedo pede. O padding aqui é o que dá área ao toque **e** o que permite o fundo aparecer
   * ao pressionar: sem contêiner, não há onde pintar.
   */
  photoAcao: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  photoAddLabel: {
    ...typography.label,
    color: cores.corDeDestaque,
  },
  /** Excluir em vermelho ao lado de "Trocar foto": são ações de peso muito diferente. */
  photoExcluirLabel: {
    ...typography.label,
    color: cores.error,
  },
  // Label "solta" usada dentro de um Card quando o campo abaixo não é um TextField com label
  // própria (ex: título da seção "Alergias"/"Contato de emergência" acima de um grupo de campos).
  fieldLabel: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  allergyChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  allergyInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  allergyInputField: {
    flex: 1,
  },
  fieldGroup: {
    gap: fieldLabelGap,
  },
  // Sem marginTop extra (diferente de contactList/allergyChipsRow): é só uma legenda simples,
  // não uma lista dinâmica que precise de respiro a mais — mantém o Card compacto quando ainda
  // não há nenhum contato cadastrado.
  emptyHint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  // Mesmo respiro de contactList/allergyChipsRow — separa a ação da lista acima dela.
  addContactButton: {
    marginTop: spacing.sm,
  },
  /** Respiro entre os campos do popup de contato — o BottomSheet não dá espaçamento próprio. */
  sheetBody: {
    gap: spacing.md,
  },
  contactList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: cores.surfaceContainerLow,
    borderWidth: 1,
    borderColor: cores.outlineVariant,
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  contactName: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  contactMeta: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  /** 44: remover contato de emergência é destrutivo, e alvo de 32 é onde o toque erra. */
  contactRemove: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
}));
