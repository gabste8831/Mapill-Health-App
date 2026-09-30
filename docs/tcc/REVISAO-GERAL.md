# Revisão geral do TCC: o que falta

> **Conferido em 30/09, 17:25**, contra `TCC Gabriel Steffens Atualizado 29_09.docx.pdf` (89
> páginas). A formatação, as referências, as siglas, os pré-textuais e a numeração a partir da
> Introdução estão certos, e as alíneas da 6.1 já estão no formato da NBR 6024.
>
> A revisão de conteúdo está em [`AJUSTES-DE-CONTEUDO.md`](AJUSTES-DE-CONTEUDO.md) (trocas prontas) e
> [`REVISAO-CRITICA.md`](REVISAO-CRITICA.md) (aprofundamento). **Ordem sugerida:** trocas de texto →
> figuras → página em branco → números de página por último, porque as trocas podem deslocar
> páginas.

---

## 1. Figuras 8, 10, 11 e 12

As quatro ainda usam a **mesma imagem de reserva** (a tela inicial repetida). Cada figura leva
**três capturas lado a lado**, na mesma altura e com espaçamento igual, do mesmo aparelho, com a
barra de status limpa e sem moldura de celular. Os dados são os da base de demonstração do
[`ROTEIRO-DAS-FIGURAS.md`](ROTEIRO-DAS-FIGURAS.md): o mesmo paciente fictício e os mesmos
medicamentos em todas as figuras. Manter o tamanho da imagem de reserva, para título, imagem e
fonte continuarem na mesma página.

### Figura 8 - Notificação do alarme de dose sobre a tela de bloqueio (p.73)

1. **Tela do alarme sobre a tela de bloqueio.**
2. **Notificação com os botões de ação**, Tomei e Pulei. No código, só a notificação comum tem
   botões, e o Adiar existe apenas na tela cheia do alarme. Para este print, usar um medicamento com
   o lembrete no modo **notificação**, e não alarme.
3. **Tela do alarme depois do adiamento, com dois medicamentos.** Mostra o agrupamento das doses do
   mesmo horário em um único aviso (4.2.1) e, sem o botão Adiar, que o adiamento é oferecido uma
   vez só. Conferir que o Adiar de fato não aparece.

### Figura 10 - Relatório clínico gerado em formato PDF (p.76)

1. **Print do PDF gerado a partir da tela de adesão.** Um print só serve, desde que o texto fique
   legível no tamanho da figura. Se o relatório tiver mais de uma página, duas páginas lado a lado
   leem melhor do que uma imagem reduzida. Usar um período com algumas faltas, para a seção de
   doses não tomadas não aparecer vazia.

### Figura 11 - Escolha do conjunto de cores de estado nas configurações de tema (p.78)

O conjunto troca três cores no app inteiro: afirmativo (azul: dose tomada, estoque em dia),
negativo (laranja: dose atrasada, estoque zerado) e atenção (marrom: estoque acabando, receita
vencendo).

1. **Configurações de tema** com "Azul, marrom e laranja" marcado.
2. **Home** com esse conjunto aplicado (dose confirmada e dose atrasada à vista).
3. **Tela de estoque ou lista de medicamentos com um item acabando**, mostrando o aviso de
   reposição em marrom, a terceira cor, que a Home quase não mostra. Deixar um medicamento da base
   de demonstração abaixo do limite de aviso. Alternativa mais simples: tela de adesão ou
   calendário nas cores novas.

### Figura 12 - Tela inicial nos temas claro, escuro e de alto contraste (p.79)

1. **Home no tema padrão.**
2. **Home no tema escuro.**
3. **Home no tema de alto contraste.**

Mesmos dados, mesmo dia e mesma rolagem nos três. Só o tema muda. Voltar o conjunto de cores para
o padrão antes, para não misturar com a Figura 11.

## 1.1 Página em branco (p.86)

Voltou a sobrar uma página vazia entre o fim da 6.1 e as REFERÊNCIAS. Apagar as linhas vazias depois
da alínea e).

## 1.2 Números de página

As trocas de conteúdo empurraram tudo **uma página** a partir do capítulo 4. A regra é simples:

- **Sumário:** de "4. DESENVOLVIMENTO" até "6.1 TRABALHOS FUTUROS", somar 1 a cada número.
  REFERÊNCIAS passa de 85 para **86**, depois de apagar a página em branco.
- **Lista de quadros:** do Quadro 2 ao Quadro 28, somar 1.
- **Lista de figuras:** da Figura 1 à Figura 12, somar 1.

Até a 3.2 e o Quadro 1, nada muda. Fazer isto por último e exportar o PDF, porque as trocas que ainda
faltam no AJUSTES podem deslocar de novo.

## 1.3 Opcional

- **Quadro 26 (p.74).** A primeira linha do código (o comentário) está em Courier 9, e as demais em 10.
- **Objetivos com marcador (p.17).** A 6.1 usa alíneas, e os objetivos, marcadores. As duas formas
  são aceitas. A linha "Implementar a aplicação móvel..." parece esticada, mas é só a justificação de
  uma linha com palavras longas, e não há o que corrigir.

## 2. Folha de aprovação (p.3), no dia da defesa

- Data: hoje está "Rio do Sul, 30 de setembro de 2026.". Trocar pela data da defesa.
- Nomes dos dois professores da banca, depois de "Prof.".

## 3. Conferência final

Depois de inserir as figuras, exportar o PDF e trazer para `docs/` pelo Explorador de Arquivos
(sem abrir e salvar no editor, que corrompe o arquivo). Eu confiro se alguma figura empurrou
página e, se for o caso, refaço os números do sumário e das listas.
