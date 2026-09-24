# Pendências do Capítulo 4

> **Atualizado em 24/09/2026.** Só o que falta fazer. A edição é feita no Google Docs.
>
> A paginação foi validada no PDF de 24/09, páginas 40 a 74. Todo quadro e toda figura estão na
> mesma página que o título e a fonte.

---

## 1. Coluna "Regra" do Quadro 10

As justificativas já foram encurtadas, mas quatro regras seguem com o texto antigo.

| Cód. | Está hoje | Deve ficar |
|---|---|---|
| 08 | A frequência preenchida no cadastro da medicação determina o número de horários a serem preenchidos. | A frequência define quantos horários preencher |
| 17 | Sincronização resolve por LWWs, tudo ou nada | Sincronização resolve pelo mais recente, tudo ou nada |
| 18 | A exclusão alcança a nuvem primeiro | O apagamento de dados alcança a nuvem primeiro |
| 19 | Doses futuras não entram no cálculo de adesão | Doses futuras sem resposta não entram na adesão |

A 19 é a que importa. Como está, contradiz a 4.6.4 e o Quadro 26, em que a dose futura já
respondida entra na conta. A 17 tem o "LWWs" com um "s" que não existe, e a 18 parece contradizer
a exclusão lógica da regra 07, quando trata do apagamento pedido pelo paciente (LGPD).

## 2. Fontes dos Quadros 3 a 8

Estão como "Fonte: elaborado pelo autor (2026).", e todas as demais como "Fonte: elaborado pelo
autor.". Tirar o "(2026)" dos seis.

## 3. Figuras 8, 10, 11 e 12

Hoje estão com imagem duplicada, só para reservar espaço. O que cada captura real mostra fica em
[`ROTEIRO-DAS-FIGURAS.md`](ROTEIRO-DAS-FIGURAS.md). Ao trocar, conferir se a captura tem o mesmo
tamanho da duplicada, senão a fonte pode descer para a página seguinte.

## 4. Números de página das listas

Por último, depois das figuras reais. A lista de figuras tem números antigos (Figura 2 na 33,
Figura 12 na 44) e a de quadros está sem número. Usar o número impresso no alto da página, não o
índice do PDF.

## 5. Sumário

As linhas vazias com estilo de título entre as seções são espaçamento intencional. Ao gerar o
sumário automático, conferir se elas entram como entradas vazias e, se entrarem, removê-las do
sumário.

---

## Fora do Capítulo 4

**Capítulo 5 Resultados.** Só o título. A seção 3.2 promete a validação da arquitetura
*offline-first* em quatro cenários, e o capítulo precisa relatá-los. Ausência de conexão,
restabelecimento e sincronização foram testados em aparelho em 08/09. O conflito entre registros
não teve teste dedicado, e falta decidir se o texto o apresenta como validado pela regra da 4.4.6
ou se ele é testado antes.

**Capítulo 6 Conclusão.** Tem só o parágrafo de trabalhos futuros. Depende do capítulo 5.

**Resumo e Abstract.** Revisar depois dos capítulos 5 e 6, para que citem os resultados.
