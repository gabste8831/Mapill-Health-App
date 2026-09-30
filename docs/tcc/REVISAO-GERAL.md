# Revisão geral do TCC: o que falta

> **Conferido em 30/09, 16:02**, contra `TCC Gabriel Steffens Atualizado 29_09.docx (2).pdf`
> (87 páginas). O texto está fechado: sumário e listas (121 entradas), remissões, chamadas de
> quadros e figuras, citações, referências e seu negrito, siglas, itálico, títulos, pré-textuais,
> numeração de página a partir da Introdução, quadros e figuras com título e fonte na mesma
> página, e as mudanças pedidas pelo orientador.
>
> Falta só o que depende de captura ou da defesa. A revisão de conteúdo, feita com o prompt de
> revisão crítica do orientador, está à parte em [`REVISAO-CRITICA.md`](REVISAO-CRITICA.md), e as
> trocas prontas para colar, em [`AJUSTES-DE-CONTEUDO.md`](AJUSTES-DE-CONTEUDO.md).

---

## 1. Figuras 8, 10, 11 e 12

As quatro ainda usam a **mesma imagem de reserva** (a tela inicial repetida). Cada figura leva
**três capturas lado a lado**, na mesma altura e com espaçamento igual, do mesmo aparelho, com a
barra de status limpa e sem moldura de celular. Os dados são os da base de demonstração do
[`ROTEIRO-DAS-FIGURAS.md`](ROTEIRO-DAS-FIGURAS.md): o mesmo paciente fictício e os mesmos
medicamentos em todas as figuras. Manter o tamanho da imagem de reserva, para título, imagem e
fonte continuarem na mesma página.

### Figura 8 - Notificação do alarme de dose sobre a tela de bloqueio (p.72)

1. **Tela do alarme sobre a tela de bloqueio.**
2. **Notificação com os botões de ação**, Tomei e Pulei. No código, só a notificação comum tem
   botões, e o Adiar existe apenas na tela cheia do alarme. Para este print, usar um medicamento com
   o lembrete no modo **notificação**, e não alarme.
3. **Tela do alarme depois do adiamento, com dois medicamentos.** Mostra o agrupamento das doses do
   mesmo horário em um único aviso (4.2.1) e, sem o botão Adiar, que o adiamento é oferecido uma
   vez só. Conferir que o Adiar de fato não aparece.

### Figura 10 - Relatório clínico gerado em formato PDF (p.75)

1. **Print do PDF gerado a partir da tela de adesão.** Um print só serve, desde que o texto fique
   legível no tamanho da figura. Se o relatório tiver mais de uma página, duas páginas lado a lado
   leem melhor do que uma imagem reduzida. Usar um período com algumas faltas, para a seção de
   doses não tomadas não aparecer vazia.

### Figura 11 - Escolha do conjunto de cores de estado nas configurações de tema (p.77)

O conjunto troca três cores no app inteiro: afirmativo (azul: dose tomada, estoque em dia),
negativo (laranja: dose atrasada, estoque zerado) e atenção (marrom: estoque acabando, receita
vencendo).

1. **Configurações de tema** com "Azul, marrom e laranja" marcado.
2. **Home** com esse conjunto aplicado (dose confirmada e dose atrasada à vista).
3. **Tela de estoque ou lista de medicamentos com um item acabando**, mostrando o aviso de
   reposição em marrom, a terceira cor, que a Home quase não mostra. Deixar um medicamento da base
   de demonstração abaixo do limite de aviso. Alternativa mais simples: tela de adesão ou
   calendário nas cores novas.

### Figura 12 - Tela inicial nos temas claro, escuro e de alto contraste (p.78)

1. **Home no tema padrão.**
2. **Home no tema escuro.**
3. **Home no tema de alto contraste.**

Mesmos dados, mesmo dia e mesma rolagem nos três. Só o tema muda. Voltar o conjunto de cores para
o padrão antes, para não misturar com a Figura 11.

## 1.1 Formatação (conferida em 30/09 contra o PDF das 16:02)

Margens (3 cm à esquerda e no topo, 2 cm à direita e embaixo), Times New Roman 12 no texto e 10 nos
quadros, espaçamento e recuo de parágrafo estão certos. Não há citação longa (mais de três linhas)
no texto, então não há recuo de 4 cm a conferir. Três ajustes:

1. **Alíneas da 6.1 (p.84).** Pela NBR 6024, a segunda linha de uma alínea começa **sob a primeira
   letra do texto**, e não sob o "a)". Hoje as linhas seguintes voltam para baixo da letra. Também
   sobram linhas em branco entre as alíneas, que devem sair (o espaçamento é o mesmo do texto).
   No Google Docs: apagar as linhas em branco entre a) e e), selecionar as cinco alíneas e, em
   **Formatar › Alinhamento e recuo › Opções de recuo**, usar **Recuo à esquerda 1,87 cm** e
   **Recuo especial: Deslocamento 0,6 cm**. O "a)" continua a 1,27 cm, como o recuo de parágrafo,
   e as linhas seguintes alinham com o texto.
2. **Objetivos (p.17), linha esticada.** No item "Implementar a aplicação móvel, contemplando o
   cadastro de medicamentos...", a primeira linha sai com as palavras espalhadas, sinal de uma
   quebra de linha manual (Shift+Enter) no meio do item. Apagar a quebra e deixar a linha correr.
3. **Opcional, marcadores.** Os objetivos usam marcadores (●), e a 6.1 usa alíneas (a, b, c). As duas
   formas são aceitas, mas a NBR 6024 prefere alíneas. Se quiser uniformizar, os objetivos
   específicos viram a) a f), com inicial minúscula, ponto e vírgula e ponto no último. Se o modelo
   da UNIDAVI traz os objetivos com marcador, pode manter.
4. **Opcional, Quadro 26 (p.73).** A primeira linha do código (o comentário) está em Courier 9, e
   as demais em 10. Igualar em 10.

## 2. Folha de aprovação (p.3), no dia da defesa

- Data: hoje está "Rio do Sul, 30 de setembro de 2026.". Trocar pela data da defesa.
- Nomes dos dois professores da banca, depois de "Prof.".

## 3. Conferência final

Depois de inserir as figuras, exportar o PDF e trazer para `docs/` pelo Explorador de Arquivos
(sem abrir e salvar no editor, que corrompe o arquivo). Eu confiro se alguma figura empurrou
página e, se for o caso, refaço os números do sumário e das listas.
