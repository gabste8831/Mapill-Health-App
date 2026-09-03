# Ajustes por tela

Documento de trabalho. O Gabriel navega pelo app e anota, tela por tela, o que quer mudar —
cada apontamento vira uma execução exata, sem extras.

**Como preencher:** escreva o pedido como um item de lista dentro da seção da tela. Quando eu
terminar, marco `[x]` e registro numa linha o que foi feito, para o histórico não se perder.

```
- [ ] Diminuir o espaço entre os cards da lista
```

---

## Onboarding

### Login [x]
`src/telas/Login/` — rota inicial, antes do consentimento.
Tela de login está perfeita estéticamente, sem pontos à levantar
- 

### Consentimento [x]
`src/telas/Consentimento/` — aceite dos termos e da LGPD.
Tela de consentimento está perfeita estéticamente, sem pontos à levantar
-

### Ficha de Saúde [x]
`src/telas/FichaDeSaude/` — cadastro do perfil (nome, dados clínicos).
temos problemas de espaçamento entre os cards e textos presentes. ajuste isso por favor
- [x] Feito: bug no `KeyboardAwareScrollView` fazia o `gap` entre cards não funcionar (o
  `Pressable` interno não herdava o espaçamento do container). Corrigido em
  `src/ui/KeyboardAwareScrollView/KeyboardAwareScrollView.tsx` — afeta também Cadastro de
  Medicamento e Cadastro de Compromisso, que usam o mesmo componente.

quando eu clico em adicionar contato, abre o "popup de "novo contato de emergência". Nisso, eu clico em um input e consequentemente o teclado surge. Eu não gosto da estética do botão "salvar contato" quando o teclado sobe, pois não existe nenhum espaçamento entre eles. é estranho. quero um espaçamento entre eles. 
- [x] Feito: o respiro inferior do `BottomSheet` caía para 16px com o teclado aberto (contra o
  padding normal). Aumentado em `src/ui/BottomSheet/BottomSheet.tsx` (`respiroInferior`).
-

### Termos
`src/telas/Termos/` — texto legal (Termos de Uso / Política de Privacidade).
Tela de termos está perfeita, tudo ok
-

---

## Abas principais

### Início (Home)
`src/telas/Inicio/` — agenda do dia, progresso, cards de estoque/adesão.

-

### Calendário
`src/telas/Calendario/` — grade do mês, agenda por dia.

percebi agora que não temos caminho para editar os compromissos... na tela calendário nós temos o calendario e tal, e a listagem dos compromissos do dia... eu queria uma opção que permitisse ver todos os comprmissos cadastrados, e queria tb a opção igual tem no medicamento -> excluir e editar
- [x] Feito: editar/excluir compromisso já existiam na agenda do dia (lápis/lixeira em cada
  compromisso, mesmo padrão de Remédios) — só faltava a lista de todos. Criada a tela
  "Compromissos" (`src/telas/Compromissos/`), com o mesmo modelo da tela Remédios: lista completa,
  editar e excluir cada um. Acesso por um botão no cabeçalho do Calendário (ícone de lista, ao
  lado do voltar). Novo hook `use-appointment-list.ts` e rota `/compromissos`.

gostei! Nessa tela, eu só não gostei muito da disposição das coisas dentro do card sabe? muita coisa dividindo a largura deixa os textos com muita quebra de linha sabe? acho que poderia ser no formato data - nome compromisso / horário - onde, e em algum cantinho as opções de editar ou excluir em algum lugar que não ocupasse tanto espaço dividindo o grid... gostei da corzinha no fundo da data -> podemos deixar o azul principal e a data em branco. o background da data pode ser um quadrado de largura e altura iguais, fixo para todas as datas
- [x] Feito: card reorganizado em 2 linhas de texto (título / horário + local + profissional),
  sem coluna própria pras ações — editar/excluir viraram ícones pequenos e compactos, empilhados
  num canto à direita. Coluna de data virou quadrado fixo 52×52 (era largura fixa, altura
  variável), fundo `corDeDestaque` (azul principal) e número em branco (`onPrimary`). Em
  `src/telas/Compromissos/CompromissosScreen.tsx` e `.styles.ts`.

gostei gostei! mas ainda assim, os ícones de editar e excluir ocupam muito espaço... quero tiralos dali para abrir mais espaço ao texto. talvez poderiamos emitir essas informações para campos internos quem sabe... esse formato de estilo pode ser atribuido á listagem de medicamentos também. Depois: quero que clicando sobre o card, possa abrir um popup com todas as informações listadas bonitinhas. E a estética do card: abaixo da data e dos textos uma linha horizontal de detalhe com espaçamento superior e inferior... abaixo dessa linha, as duas opções "editar" e "excluir" dividindo 50%/50% do width total. Depois: pode retirar a linha horizontal, gostei da separação com a linha vertical, mas com menos destaque (cinza mais clarinho / opacidade mais baixa). Depois: adicione instrução no topo sobre clicar no compromisso — e reverteu, pediu pra tirar o texto. Por fim: o espaçamento do "N compromissos cadastrados" ficou zoado (só padding bottom, grande demais) — pediu padding top igual ao bottom.
- [x] Feito, em várias rodadas: (1) card inteiro (exceto a faixa de ações) virou clicável, abrindo
  um `BottomSheet` com todos os detalhes (`DetalheDoCompromisso`/`DetalheDoRemedio` — quando, onde,
  profissional, aviso, preparo, desfecho / princípio ativo, dose, frequência, horários, estoque,
  onde guardado). (2) Editar/excluir viraram uma faixa abaixo do card, dividindo a largura 50/50,
  com um traço vertical discreto entre os dois (`outlineVariant` a 50% de opacidade) — sem linha
  horizontal (foi tentada e removida a pedido). (3) Mesmo padrão aplicado em Remédios
  (`RemediosScreen.tsx`) e Compromissos. (4) `listHeader` da lista de Compromissos com padding
  simétrico (`spacing.md` em cima e embaixo, era `marginBottom: gutter` só embaixo).

### Remédios
`src/telas/Remedios/` — lista de medicações cadastradas.
Mesma reorganização de card aplicada nessa tela junto com Compromissos — ver histórico acima.

na tela de "medicações podemos manter o mesmo estilo da tela que estilizamos agora (compromissos)... aquele texto "abaixo, suas medicações... podemos retirar. A busca está legal, mas acho ela muito carregada... acho que podemos tirar aquela borda
- [x] Feito: removido o texto de instrução "Abaixo, suas medicações...". Retirada a borda do
  `SearchField` (era `borderWidth: 2`) — troquei por sombra, mesma regra do resto do app; o foco
  continua sinalizado pela lupa que já ficava azul ao focar. Componente compartilhado, mas só usado
  nesta tela, então a mudança não afeta mais nada.

aquela notificação de "X alterações ainda não subiram..." pode tirar dessa página tb... isso poderá ser visto em ajustes
- [x] Feito: `AvisoDePendencias` removido de Remédios (`useSync` também saiu, ficou sem uso) e
  adicionado em Ajustes, logo abaixo do hero de identidade — faz mais sentido lá, é sobre a conta,
  não sobre os remédios em si.

no card de medicamentos, podemos deixar igual ao de compromissos... nome do medicamento e principio ativo com "..." se não caber na mesma linha
- [x] Feito: `numberOfLines={1}` no nome e no princípio ativo do card — cortam com reticências em
  vez de quebrar linha, mesmo padrão do título/horário em Compromissos.

top... agora só quero ajustar a disposição da indicação de "1 comprimido" "frequencia" e horário... n ta me agradando muito como está.. preciso de ideias pra organizar. Será que exige mostrar tudo isso ali? / outra coisa precisamos ajustar o espaçamento de "1 medicação cadastrada".. o padding bottom está demais
- [x] Feito: a dose por tomada ("1 comprimido") saiu do card — ao lado do estoque no rodapé ela
  lia como "quanto tenho guardado", confundindo com a quantidade em estoque. Virou uma linha só:
  "Todo dia · 08:00, 14:00, 20:00" (frequência + horários, sem a fileira de chips), cortando com
  reticências se não couber. A dose por extenso continua no popup de detalhe. `listHeader` com
  padding simétrico (mesmo ajuste de Compromissos).

tá... o espaçamento de 1 medicação cadastrada não está nada parecido com o presente na tela compromissos... ajuste de acordo, e padronize às demais aparições no app. gostei da disposição de frequencia e horários, só precisamos dar um padding top nesse bloco, pra n ficar colado na imagem do remédio. depois: a contagem já atualiza com a busca?
- [x] Feito: a causa era estrutural — em Remédios a contagem mora num bloco FIXO no topo (com
  busca e ordenação), diferente de Compromissos onde ela mora dentro do bloco que rola. Ajustado o
  respiro ao redor dela (`marginTop: md`, `marginBottom: sm`) pra ter a mesma proporção visual das
  duas telas. Adicionado `marginTop: xs` na linha de frequência/horários, separando da foto.
  Confirmado: a contagem já é dinâmica ("2 de 5 medicações" durante a busca, "5 medicações
  cadastradas" sem busca) — mantido como está.

o "todo dia" ficou ótimo, mas a contagem continuou sem refletir a mudança / na real podemos ajustar o card de medicação substituindo o princípio ativo pela frequência/horários... não tem pq o principio ativo constar ali
- [x] Feito: reestruturado — a linha "Todo dia · 08:00, 14:00, 20:00" agora entra no lugar do
  princípio ativo, dentro do cabeçalho (ao lado da foto, abaixo do nome), em vez de ficar como
  linha separada abaixo. Princípio ativo saiu do card por completo (continua no popup de detalhe).
  Isso resolveu de vez o problema de espaçamento da linha anterior — ela não é mais uma linha solta
  com margem própria, é parte do mesmo bloco do cabeçalho. Sobre a contagem "1 medicação
  cadastrada": os valores de margem estavam corretos no código (conferido de novo); se ainda não
  refletir depois de recarregar, pode ser cache do bundler — avisar que investigo mais fundo.
-

### Ajustes
`src/telas/Ajustes/` — aparência, conta e dados.
A tela de ajustes precisa ser resumida em um grande menu, que agrupa os "botões", que darão acesso à páginas...
Hoje, é necessátrio retirar o texto "seus dados ficam neste aparelho...". quero somente botões.
O esquema desenvolvido por seções, como "conta e dados" é ótimo, tendo os botões daquela seção ali, como o botão "conta e dados". nesses botões, quero poder retirar o subtitulo (o texto abaixo de "conta e dados"), e manter esse padrão aos demais que virão.
um grande exemplo são essas novas opções de temas... elas não devem ficar ali. Devem ficar dentro de uma seção 'acessibilidade', em um botão "configurações de tema" (ou a escolha de palavras ideal ao caso), e aí sim abrir para esses botões que definem a escolha desses temas.
- [x] Feito: removidos os dois textos de rodapé (`sectionFooter`) e o hint genérico de "Conta e
  dados" — o botão só mostra o e-mail quando há conta vinculada (`hint={accountEmail ?? undefined}`
  em `AjustesScreen.tsx`). Nova seção "ACESSIBILIDADE" com o botão "Configurações de tema", que
  abre `/tema` — tela nova (`src/telas/Tema/TemaScreen.tsx`) hospedando o seletor de aparência que
  antes ficava expandido dentro de Ajustes.
-

---

## Cadastro e edição

### Escolha de Cadastro
`src/telas/EscolhaDeCadastro/` — "medicação ou compromisso?".
aqui está tudo perfeito
-

### Cadastro de Medicamento
`src/telas/CadastroDeMedicamento/` — formulário completo (nome, dose, horários, estoque,
lembrete).
na tela de escolher entre escanear código de barras e cadastro manual, acho que o cadastro manual pode ser a opção acima de escanear código de barras... inverter só
- [x] Feito: ordem invertida em `src/app/cadastro/medicamento.tsx` — "Cadastro manual" primeiro,
  "Escanear código de barras" depois.

acho que aquela parte de quando "seu medicamento já pode ser cadastrado" precisa de mudança... o texto que vem abaixo pode ser BEM mais simples e ocupar menos espaço. Além de podermos adicionar um espaçamento maior na parte de cima e baixo desse bloco, e quem sabe algum outro detalhe, que indique uma "separação", uma segunda etapa sabe? uma linha divisória talvez
- [x] Feito: texto reduzido para "Já pode cadastrar!" / "O resto abaixo é opcional." (era duas
  frases longas). Adicionado respiro maior acima/abaixo do bloco (`paddingTop: lg`, `paddingBottom:
  sm`, `marginTop: sm`) e um traço divisório acima (`borderTopWidth`) marcando a virada de etapa.
  Em `CadastroDeMedicamento.styles.ts` (`revelacao`) e `FormularioDeMedicamentoScreen.tsx`.

acho que o layout de sugestões ao escrever o nome de um medicamento que consta na base de dados cmed pode ser diferente... acho que ele pode aparecer grudado mesmo no input, não precisa aparecer o princípio ativo da medicação. Isso deixa o escopo da opção reduzido, sendo mais fácil de entender... o texto "encontrados na base da avisa" é muito grande... pode ser algo como "medicações oficiais" ou algo como "é algum destes?"
- [x] Feito: lista de sugestões agora gruda no campo (mesma borda do TextField, cantos de cima
  retos continuando a linha do campo, só os de baixo arredondados). Removido o princípio ativo de
  cada item — só nome e dosagem. Título trocado de "Encontrados na base da Anvisa" para "É algum
  destes?". Em `src/ui/SugestoesDeMedicamento/`.
-

### Scanner
`src/telas/Scanner/` — leitura do código de barras da caixa.

-

### Cadastro de Compromisso
`src/telas/CadastroDeCompromisso/` — consulta, exame, renovação de receita.

-

---

## Fluxo de dose e alarme

### Horário
`src/telas/Horario/` — tela aberta ao tocar numa notificação simples.

-

### Alarme
`src/telas/Alarme/` — tela cheia do alarme de dose (toca som, pede resposta).

-

### Adesão
`src/telas/Adesao/` — relatório de adesão ao tratamento.

-

---

## Estoque e conta

### Estoque
`src/telas/Estoque/` — controle de quantidade por medicamento.

-

### Conta
`src/telas/Conta/` — dados da conta, sincronização, exclusão.

-

---

## Outras

### Em Construção
`src/telas/EmConstrucao/` — placeholder para funcionalidade ainda não implementada.

-
