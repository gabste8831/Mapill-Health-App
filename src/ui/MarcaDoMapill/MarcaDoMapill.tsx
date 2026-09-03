import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

import { useEstilos } from "@/shared/theme";
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
  // Proporção do ícone original (1000x1000, cápsula ocupando o quadro inteiro).
  const largura = tamanho;

  return (
    <View style={[styles.raiz, style]} accessibilityRole="image" accessibilityLabel="Mapill">
      <Svg width={largura} height={tamanho} viewBox="0 0 1000 1000">
        <Path
          fill="#196FF3"
          d="m340 181c-3.02 0.44-10 1.35-15.5 2.02-5.5 0.67-15.18 2.69-21.5 4.49-6.32 1.81-16.45 5.49-22.5 8.18-6.05 2.69-14.82 7.39-19.5 10.43-4.68 3.05-11.88 8.25-16 11.57-4.13 3.32-10.84 9.58-14.92 13.92-4.08 4.34-10.09 11.49-13.36 15.89-3.27 4.4-7.8 11.15-10.07 15-2.27 3.85-6.06 11.73-8.43 17.5-2.37 5.77-5.63 15.23-7.25 21-1.62 5.77-3.63 15.11-4.46 20.75-0.83 5.64-1.5 15.76-1.49 22.5 0.01 6.74 0.63 16.52 1.37 21.75 0.74 5.23 2.51 13.77 3.93 19 1.42 5.23 4.12 13.55 6 18.5 1.88 4.95 5.27 12.71 7.55 17.25 2.27 4.54 5.77 10.61 7.77 13.5 2 2.89 6.13 8.4 9.19 12.25 3.05 3.85 15.02 16.66 26.61 28.48 11.58 11.81 45.92 46.57 76.31 77.25 30.39 30.67 55.81 55.78 56.5 55.8 0.69 0.02 38.18-37.22 83.31-82.75 45.13-45.53 95.76-96.66 112.5-113.63 16.74-16.97 30.58-31.59 30.76-32.5 0.21-1.05-8.35-10.38-23.53-25.65-13.11-13.2-47.91-48.3-77.32-78.01-30.88-31.19-56.85-56.58-61.47-60.09-4.4-3.34-11.83-8.37-16.5-11.19-4.68-2.81-12.55-6.87-17.5-9.02-4.95-2.15-13.05-5.09-18-6.53-4.95-1.44-11.93-3.28-15.5-4.1-3.58-0.81-11.23-1.94-17-2.51-5.77-0.56-11.4-1.21-12.5-1.44-1.1-0.23-4.48-0.05-7.5 0.39z"
        />
        <Path
          fill="#7ED6FE"
          d="m529.41 478.7c-48.36 48.84-98.95 99.96-112.42 113.6-13.47 13.65-24.6 25.68-24.74 26.75-0.18 1.4 21.49 23.92 76.5 79.54 61.43 62.1 78.65 78.95 86.25 84.41 5.23 3.75 12.65 8.74 16.5 11.08 3.85 2.34 10.15 5.69 14 7.43 3.85 1.75 11.28 4.59 16.5 6.31 5.23 1.73 13.33 4.04 18 5.15 4.67 1.11 14.58 2.5 22 3.08 9.79 0.78 16.53 0.77 24.5-0.05 6.05-0.61 13.92-1.73 17.5-2.48 3.58-0.75 11.67-3.04 18-5.09 6.33-2.05 15.33-5.48 20-7.64 4.67-2.15 13.64-7.37 19.93-11.6 6.38-4.29 16.1-12.15 22-17.8 6.98-6.67 13.58-14.31 19.42-22.5 4.87-6.81 10.8-16.44 13.17-21.39 2.37-4.95 6.1-14.17 8.28-20.5 2.19-6.33 5.04-16.45 6.34-22.5 2.05-9.55 2.35-13.63 2.31-31-0.04-16.99-0.39-21.58-2.33-30.5-1.26-5.77-3.84-15.23-5.75-21-1.9-5.77-5.6-15-8.23-20.5-2.62-5.5-6.85-13.15-9.39-17-2.54-3.85-7.61-10.6-11.26-15-3.66-4.4-40.23-41.98-81.28-83.5-41.04-41.52-75.36-75.63-76.25-75.8-1.04-0.19-33.49 31.88-89.55 88.5z"
        />
      </Svg>
      <Text style={styles.wordmark}>Mapill</Text>
    </View>
  );
}
