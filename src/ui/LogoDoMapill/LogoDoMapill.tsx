import { Image } from "expo-image";
import type { StyleProp, ImageStyle } from "react-native";

import { useTema } from "@/shared/theme";

/** A proporção dos dois arquivos (1000×333). A altura sai dela, e não de um número à parte. */
const PROPORCAO = 1000 / 333;

type LogoDoMapillProps = {
  /** Largura em pt. A altura acompanha, na proporção do lockup. */
  largura?: number;
  /**
   * Força a versão para fundo escuro, quando o fundo **não** é o da tela - o azul cheio de um
   * card, por exemplo. Sem isto a escolha vem do tema em vigor.
   */
  sobreFundoEscuro?: boolean;
  style?: StyleProp<ImageStyle>;
};

/**
 * A marca do Mapill: o quadrado azul com a capsula, e a palavra ao lado.
 *
 * Dois arquivos, e nao um com a cor trocada: o que muda entre eles e so a palavra, escura ou
 * branca conforme o fundo. O quadrado e a capsula sao identicos nos dois, porque marca que muda de
 * cor conforme a tela deixa de ser reconhecida.
 *
 * Com um PNG so, de palavra em preto congelado, a marca desaparecia no tema escuro. A escolha do
 * arquivo e feita aqui, uma vez, em vez de cada tela lembrar de qual usar.
 */
export function LogoDoMapill({ largura = 220, sobreFundoEscuro, style }: LogoDoMapillProps) {
  const { tema } = useTema();
  const escuro = sobreFundoEscuro ?? tema.esquema === "escuro";

  return (
    <Image
      source={
        escuro
          ? require("@/assets/images/brand/lockup-escuro.png")
          : require("@/assets/images/brand/lockup-claro.png")
      }
      style={[{ width: largura, height: largura / PROPORCAO }, style]}
      contentFit="contain"
      accessibilityLabel="Mapill"
    />
  );
}
