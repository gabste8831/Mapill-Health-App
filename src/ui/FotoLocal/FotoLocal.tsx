import { Image } from "expo-image";
import { File } from "expo-file-system";
import type { StyleProp, ImageStyle } from "react-native";

import { useCores } from "@/shared/theme";

export type FotoLocalProps = {
  /** Caminho no diretório de documentos do app, vindo de `persistPickedFile`. */
  uri: string;
  style?: StyleProp<ImageStyle>;
  /**
   * Como a imagem preenche o espaço. `cover` (padrão) para miniatura, onde o corte não custa nada
   * e o enquadramento cheio é o que faz a lista ficar alinhada.
   *
   * `contain` para quando a imagem é **lida** e não reconhecida — a receita ampliada, em que cortar
   * a borda pode cortar justamente a posologia escrita à mão no canto.
   */
  contentFit?: "cover" | "contain";
};

/**
 * Foto escolhida pelo paciente — da ficha, da caixa do remédio ou da receita.
 *
 * Existe por causa do cache do `expo-image`, que guarda em memória e em disco indexado pela URI.
 * Arquivo local recém-escrito com a mesma URI de um anterior volta do cache em vez de ser lido do
 * disco, e a foto que acabou de ser escolhida não aparece. `persistPickedFile` já gera nome único
 * justamente para evitar isso, mas depender só disso deixa a proteção espalhada: basta uma tela
 * futura reutilizar um caminho para o bug voltar, e ele volta silencioso — a tela mostra *uma*
 * imagem, só que a errada.
 *
 * `recyclingKey` amarra o componente à URI atual, então trocar a foto descarta a view anterior em
 * vez de reaproveitá-la.
 *
 * ## O que a miniatura branca ensinou (06/09)
 *
 * O defeito sobreviveu a três correções, e as duas primeiras erraram o alvo porque atacaram o cache
 * como se ele fosse o risco. Ele **era** o risco original — nome de arquivo fixo fazia a foto nova
 * herdar a imagem da anterior —, mas isso já tinha sido resolvido na origem: `persistPickedFile`
 * gera nome único por escolha, então duas fotos nunca compartilham URI.
 *
 * Com a causa já eliminada, `cachePolicy="none"` deixou de proteger de alguma coisa e passou a
 * custar: sem cache de memória, a imagem recém-escolhida não estava pronta para o primeiro paint, e
 * só aparecia quando a tela remontava. Proteção redundante contra um problema que não existe mais é
 * o que produz o defeito seguinte.
 */
/** Só a hora, com milissegundos — é a distância entre os eventos que diagnostica, não o relógio. */
function agora(): string {
  return new Date().toISOString().slice(11, 23);
}

export function FotoLocal({ uri, style, contentFit = "cover" }: FotoLocalProps) {
  const cores = useCores();

  /**
   * Instrumentação temporária (06/09) — remover quando a miniatura branca fechar.
   *
   * Quatro correções erraram o alvo porque cada uma partiu de uma hipótese sobre o `expo-image` em
   * vez de um fato. Estas duas linhas separam o que sobrou: se este log aparece com a URI nova e a
   * imagem ainda não pinta, o componente **recebeu** o caminho e o problema é da biblioteca; se ele
   * não aparece, a tela não re-renderizou e o problema é de estado.
   */
  if (__DEV__) {
    let estado = "?";
    try {
      const arquivo = new File(uri);
      estado = arquivo.exists ? `existe, ${arquivo.size ?? "?"} bytes` : "NÃO EXISTE";
    } catch (cause) {
      estado = `caminho inválido (${String(cause)})`;
    }
    console.log(`[Mapill/foto] render — ${estado} — ${agora()} — ${uri}`);
  }

  return (
    <Image
      /**
       * `key` na URI **remonta o componente** quando a foto muda, e é a segunda camada contra a
       * miniatura branca.
       *
       * `recyclingKey` (abaixo) limpa o conteúdo da view antes de carregar a próxima, mas ela
       * continua sendo a mesma view — e no Android isso deixa espaço para o carregador reaproveitar
       * o que já tinha em vez de reler o disco. `key` é a instrução que o React entende sem
       * ambiguidade: outra URI, outro componente. Custo zero aqui, porque trocar de foto não é
       * operação de rolagem.
       *
       * Os dois juntos, e não um ou outro: `key` cobre a troca de foto, `recyclingKey` cobre o
       * reaproveitamento de view dentro de lista.
       */
      key={uri}
      source={{ uri }}
      // O cinza vem antes do `style` de quem chama, que pode sobrescrevê-lo — é só o piso para o
      // quadrado nunca ficar transparente enquanto a imagem carrega.
      style={[{ backgroundColor: cores.surfaceContainer }, style]}
      contentFit={contentFit}
      /**
       * `memory`, e **não** `none`.
       *
       * `none` era a terceira proteção contra a mesma coisa que `key` e `recyclingKey` já cobrem —
       * servir a imagem antiga quando a URI muda. Só que ele desliga também o cache de **memória**,
       * e é dali que sai o primeiro paint: sem ele, a imagem recém-escolhida só aparecia na segunda
       * montagem da tela. Era exatamente o sintoma que sobrou depois das duas correções anteriores
       * — miniatura branca ao escolher, foto certa ao sair e voltar.
       *
       * Servir a imagem errada continua impossível: `persistPickedFile` gera nome único por escolha,
       * então duas fotos nunca compartilham URI, e `key={uri}` remonta o componente quando ela muda.
       * O cache de memória só pode devolver o que foi pedido com aquela URI exata.
       *
       * `memory` e não `memory-disk`: o arquivo **já está** no disco do aparelho, e uma segunda
       * cópia em disco não compra nada.
       */
      cachePolicy="memory"
      recyclingKey={uri}
      transition={150}
      /**
       * A falha de carregamento **aparece no console**, em vez de virar um quadrado cinza calado.
       *
       * A miniatura branca já foi corrigida duas vezes por hipótese — cache, depois corrida na
       * cópia — e voltou nas duas. O que faltava era saber se o `expo-image` sequer tentou ler o
       * arquivo e falhou, ou se ele nunca recebeu URI nenhuma: os dois produzem o mesmo quadrado
       * vazio na tela e têm causas opostas. Só em `__DEV__`, porque é instrumento de diagnóstico.
       */
      onError={({ error }) => {
        if (__DEV__) console.error(`[Mapill/foto] ERRO — ${error} — ${uri}`);
      }}
      /**
       * O ciclo inteiro, e não só o fim (06/09).
       *
       * O log de 06/09 mostrou `render — existe, 142156 bytes` e **mais nada**: nem `onLoad`, nem
       * `onError`. Um arquivo válido que nem termina de carregar nem falha é um estado que a
       * biblioteca não deveria produzir — então o que falta saber é se ela chegou a **começar**.
       *
       * `onDisplay` é distinto de `onLoad` na API ("rendered the source image" vs "load completes"),
       * e é ele que corresponde ao pixel na tela.
       */
      onLoadStart={() => {
        if (__DEV__) console.log(`[Mapill/foto] 1. começou a carregar — ${agora()}`);
      }}
      onLoad={() => {
        if (__DEV__) console.log(`[Mapill/foto] 2. carregou — ${agora()}`);
      }}
      onDisplay={() => {
        if (__DEV__) console.log(`[Mapill/foto] 3. exibiu — ${agora()}`);
      }}
    />
  );
}
