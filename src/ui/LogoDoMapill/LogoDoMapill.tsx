import { Image } from "expo-image";
import type { StyleProp, ImageStyle } from "react-native";

import { useTema } from "@/shared/theme";

/** A proporção dos dois arquivos (1000×333). A altura sai dela, e não de um número à parte. */
const PROPORCAO = 1000 / 333;

type LogoDoMapillProps = {
  /** Largura em pt. A altura acompanha, na proporção do lockup. */
  largura?: number;
  /**
   * Força a versão para fundo escuro, quando o fundo **não** é o da tela — o azul cheio de um
   * card, por exemplo. Sem isto a escolha vem do tema em vigor.
   */
  sobreFundoEscuro?: boolean;
  style?: StyleProp<ImageStyle>;
};

/**
 * A marca do Mapill: o quadrado azul com a cápsula, e a palavra "Mapill" ao lado.
 *
 * ## Dois arquivos, e não um com a cor trocada
 *
 * O que muda entre eles é **só a palavra** — escura na versão para fundo claro, branca na versão
 * para fundo escuro. O quadrado azul e a cápsula são idênticos nos dois: eles são a marca, e marca
 * que muda de cor conforme a tela deixa de ser reconhecida. É a mesma lógica do ícone do app, que
 * não vira outro desenho quando o celular entra no modo escuro.
 *
 * ## Por que dois arquivos resolvem o defeito antigo
 *
 * A marca já foi um PNG só (`mark-transparent-a.png`), com a palavra em preto congelado — e por
 * isso ela **desaparecia** no tema escuro, onde o cabeçalho é quase preto. Foi esse defeito que
 * levou a desenhar a wordmark em texto e, agora, a ter uma versão por esquema: a escolha do
 * arquivo é feita aqui, uma vez, em vez de cada tela lembrar de qual usar.
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
