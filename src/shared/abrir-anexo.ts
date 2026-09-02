import * as Sharing from "expo-sharing";

/**
 * Abre um anexo que não é imagem — hoje, a receita em PDF.
 *
 * ## Por que a folha de compartilhamento, e não um visualizador próprio
 *
 * Ler um PDF dentro do app exigiria uma dependência nativa (WebView ou leitor dedicado), isto é,
 * uma build nova. E entregaria menos: o leitor que a pessoa já tem no aparelho tem zoom, busca,
 * rolagem entre páginas e — o que mais importa numa receita — a opção de imprimir e de mandar para
 * alguém. Reimplementar isso mal seria pior que não reimplementar.
 *
 * É o mesmo caminho pelo qual o relatório em PDF já sai do app, então a folha que aparece é uma que
 * a pessoa já viu aqui dentro.
 *
 * Devolve `false` quando não há como abrir — quem chama decide o que dizer. O erro não é lançado:
 * falhar ao abrir um anexo não deve derrubar o formulário que o continha.
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
