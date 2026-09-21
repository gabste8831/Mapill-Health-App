import * as Sharing from "expo-sharing";

/**
 * Abre um anexo que nao e imagem, hoje a receita em PDF.
 *
 * Pela folha de compartilhamento, e nao por um visualizador proprio: ler PDF dentro do app exigiria
 * dependencia nativa e entregaria menos, porque o leitor que a pessoa ja tem traz zoom, busca,
 * impressao e o envio para alguem, que e o que mais importa numa receita.
 *
 * Devolve `false` quando nao ha como abrir, e nao lanca: falhar ao abrir um anexo nao deve derrubar
 * o formulario que o continha.
 */
export async function abrirDocumento(uri: string): Promise<boolean> {
  if (!(await Sharing.isAvailableAsync())) return false;

  try {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      // O título aparece no cabeçalho da folha do Android. Diz o que é, e não o nome do arquivo:
      // "receita_2026_final(1).pdf" não ajuda ninguém a decidir em que app abrir.
      dialogTitle: "Abrir a receita",
      UTI: "com.adobe.pdf",
    });
    return true;
  } catch {
    // A pessoa fechar a folha sem escolher nada cai aqui em alguns aparelhos, e isso não é falha:
    // ela viu as opções e desistiu. Tratar como erro mostraria um alerta por um gesto deliberado.
    return true;
  }
}
