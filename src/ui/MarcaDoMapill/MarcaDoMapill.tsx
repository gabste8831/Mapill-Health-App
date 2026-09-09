import { Text, View, type StyleProp, type ViewStyle } from "react-native";

import { useEstilos } from "@/shared/theme";
import { CapsulaDoMapill } from "@/ui/CapsulaDoMapill/CapsulaDoMapill";
import { criarEstilos } from "./MarcaDoMapill.styles";

type MarcaDoMapillProps = {
  /** Altura do ícone da cápsula em pt — a wordmark escala junto, na mesma proporção do lockup. */
  tamanho?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * O lockup "Mapill" (ícone + palavra), desenhado — nunca mais uma imagem estática.
 *
 * ## O bug que isto conserta
 *
 * A marca vivia como PNG (`mark-transparent-a.png`): a palavra "Mapill" pintada em preto sobre
 * fundo transparente. Enquanto o app só tinha o tema claro, "preto sobre fundo claro" bastava. No
 * tema escuro o header vira quase-preto, e a wordmark preta sobre ele **desaparece por completo**
 * — é a mesma classe de bug que motivou toda a migração para tema: cor congelada num asset em vez
 * de lida do tema em vigor.
 *
 * A saída não é gerar uma segunda imagem para o escuro (viraria uma terceira quando o tema de
 * alto contraste precisar de outra tinta ainda, e uma quarta para o de daltonismo). É desenhar: o
 * ícone da cápsula vem de `mark.svg`, que já não depende de tema (é azul-claro-e-branco, legível
 * em qualquer fundo), e a palavra é texto de verdade — cor obtida do tema como qualquer outro
 * texto do app.
 */
export function MarcaDoMapill({ tamanho = 28, style }: MarcaDoMapillProps) {
  const styles = useEstilos(criarEstilos);

  return (
    <View style={[styles.raiz, style]} accessibilityRole="image" accessibilityLabel="Mapill">
      <CapsulaDoMapill tamanho={tamanho} />
      <Text style={styles.wordmark}>Mapill</Text>
    </View>
  );
}
