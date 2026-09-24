# Roteiro das Figuras do Capítulo 4

> **Levantado em 23/09/2026**, contra `TCC Gabriel Steffens Atualizado 23_09.docx.md`.
>
> **O que este documento é.** A lista do que cada figura pendente precisa mostrar, tela por
> tela. Cada figura reúne três capturas lado a lado, salvo onde indicado.
>
> **Como usar.** Montar a base de demonstração descrita abaixo uma única vez, depois percorrer
> as figuras na ordem. Marcar cada print conforme capturar.

---

## Estado atual

Cinco figuras preenchidas, sete vazias. Conferido pelos marcadores de imagem do arquivo
exportado: há cinco referências `![][imageN]` e cinco definições correspondentes no rodapé,
em sequência sem lacuna, o que indica que as figuras 6 a 12 nunca foram inseridas, e não que
a exportação as tenha perdido.

| Figura | Conteúdo | Estado |
|---|---|---|
| 1 | Diagrama de sequência do Last-Write-Wins | ✅ preenchida |
| 2 | Diagrama entidade-relacionamento | ✅ preenchida |
| 3 | Login, consentimento e ficha de saúde | ✅ preenchida |
| 4 | Identificação por código de barras | ✅ preenchida |
| 5 | Formulário de cadastro de medicação | ✅ preenchida |
| 6 | Configurações adicionais do cadastro | ⬜ vazia |
| 7 | Tela inicial com doses agrupadas por estado | ⬜ vazia |
| 8 | Alarme sobre a tela de bloqueio | ⬜ vazia |
| 9 | Adesão e calendário | ⬜ vazia |
| 10 | Relatório clínico em PDF | ⬜ vazia |
| 11 | Conjuntos de cores de estado | ⬜ vazia |
| 12 | Tela inicial nos três temas | ⬜ vazia |

---

## Base de demonstração

Montar antes de capturar qualquer coisa. Sem ela os prints não conversam entre si, e a
incoerência entre figuras é visível para quem lê o capítulo inteiro.

- **Medicamentos.** De três a quatro, com nomes reais do catálogo CMED. Por exemplo Losartana
  50 mg, Metformina 850 mg, Sinvastatina 20 mg e AAS 100 mg.
- **Paciente.** Fictício, com nome plausível. Nunca o nome real nem dados de saúde reais.
- **Histórico.** De vinte a trinta dias, com adesão entre oitenta e noventa por cento. Cem por
  cento parece forjado, cinquenta parece abandono.
- **No dia da captura.** Uma dose atrasada, uma na hora, duas confirmadas e uma futura.

---

## Regras que valem para todas

- Mesmo aparelho e mesma resolução em todos os prints.
- Barra de status limpa, sem notificações alheias, com bateria e hora plausíveis.
- Os três prints alinhados na horizontal, mesma altura, espaçamento igual entre eles.
- Sem moldura de celular desenhada em volta.
- Dados coerentes entre figuras: o mesmo paciente e os mesmos medicamentos do começo ao fim.

---

## Figura 6 - Configurações adicionais do cadastro de medicação

O texto promete três decisões que encerram o cadastro. Um print para cada.

1. **Exigência de receita.** Anexo com a validade preenchida e o aviso de renovação visível.
2. **Configurações de lembrete.** As opções de alarme sonoro e notificação comum à vista, com
   uma delas selecionada.
3. **Controle de estoque.** Quantidade, local de guarda e o aviso de reserva baixa com a
   antecedência escolhida.

---

## Figura 7 - Tela inicial com as doses do dia agrupadas por estado

O texto afirma **dois grupos** (aguardando resposta e já registradas) e **seis estados
visuais**. A figura precisa sustentar as duas afirmações.

1. **Tela inicial completa**, rolada ao topo, com os dois grupos e seus cabeçalhos visíveis.
2. **Recorte do grupo pendente**, com atrasada, na hora e futura aparecendo juntas.
3. **Recorte do grupo registrado**, com confirmada e pulada lado a lado. É o que sustenta a
   afirmação de que dose pulada e dose sem registro são coisas distintas.

Incluir o indicador de progresso diário em ao menos um dos prints, já que a 4.6.5 o menciona.

---

## Figura 8 - Notificação do alarme sobre a tela de bloqueio

**Duas capturas bastam.** Uma tela de bloqueio não rende três ângulos sem repetição.

1. **Tela cheia do alarme sobre o bloqueio**, com medicamento, dose e local de guarda legíveis
   e as três ações visíveis: Tomei, Pulei e Adiar.
2. **Notificação com ações rápidas**, com o aparelho em uso. É o outro caminho que o texto
   descreve.

Terceiro print opcional: o **estado após o adiamento**, com o botão Adiar já ausente. Comprova
visualmente a regra de negócio de código 12, que o texto afirma logo abaixo da figura.

---

## Figura 9 - Tela de adesão e calendário de acompanhamento

1. **Tela de adesão**, com a taxa consolidada do período e a distribuição dia a dia.
2. **Calendário mensal**, com a marcação por tipo, doses e compromissos.
3. **Um dia anterior aberto**, mostrando as doses daquela data. É o que sustenta a frase sobre
   correção retroativa a partir dessa tela.

---

## Figura 10 - Relatório clínico gerado em formato PDF

Não é tela do aplicativo, é o documento gerado.

1. **Cabeçalho do relatório**, com a identificação do paciente e o período.
2. **Seção de adesão e tratamentos** do período.
3. **Histórico de doses.**

Se o relatório couber em uma única página, capturar a página inteira e usar o recorte do
cabeçalho como segundo print, em vez de forçar três.

---

## Figura 11 - Escolha do conjunto de cores de estado

O texto cita quatro conjuntos alternativos e nomeia o `azulLaranja` no bloco de código logo
acima da figura.

1. **Configurações de tema** com a lista dos conjuntos, incluindo as descrições.
2. **O conjunto "Azul, marrom e laranja" selecionado.** É o mesmo do bloco de código, e usá-lo
   amarra o texto à imagem.
3. **Tela inicial com esse conjunto aplicado**, mostrando o efeito real nas cores das doses.

---

## Figura 12 - Tela inicial nos temas claro, escuro e de alto contraste

Esta já é naturalmente três: a **mesma tela inicial, com os mesmos dados**, nos três temas.

1. Tema claro.
2. Tema escuro.
3. Tema de alto contraste.

Nada pode mudar entre os prints exceto o tema: mesmo dia, mesmas doses, mesma posição de
rolagem. No print de alto contraste, enquadrar uma borda entre superfícies, já que o texto
afirma que ali a sombra dá lugar a contorno.

---

## Pendências de acabamento ligadas às figuras

### Lista de Figuras desatualizada

A Lista de Figuras traz apenas a Figura 1, e a descreve como o diagrama entidade-relacionamento,
que hoje é a Figura 2. Precisa ser refeita por inteiro depois que as doze estiverem inseridas.

### Legenda de fonte colada à imagem, na Figura 3

No arquivo exportado, o marcador de imagem e a fonte estão na mesma linha, enquanto nas
Figuras 4 e 5 há quebra entre eles. Convém conferir no Word se a linha de fonte ficou sem
parágrafo próprio.

### Conferência das Figuras 3, 4 e 5

As três já têm imagem, mas não foram conferidas contra o que o texto promete. Vale a mesma
checagem feita para as demais antes do fechamento.
