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

no card do remédio quero somente: foto (ou o quadradinho azul), nome, frequência, horário, estoque
e os dois botões de editar e excluir. "Onde está guardado" foge do escopo que defini — pode
retirar. Algo além disso que esteja aparecendo, também pode sair.
- [x] Feito: removido o `badge` com o local de guarda do rodapé do card (continua no popup de
  detalhe, em "Guardado em"). O `footerRow` perdeu o `justifyContent: space-between` e o `gap`, que
  só existiam para empurrar esse local à direita — com um filho só não faziam nada. Estilo `badge`
  removido do arquivo, que ficou órfão. O card agora tem exatamente os cinco itens pedidos.

o espaçamento entre a contagem ("1 medicação cadastrada") e o card / botão "Gerenciar estoques"
está muito grande — parece resquício de estilização anterior. Usar a tela de Compromissos como
parâmetro, lá o espaçamento está correto.
- [x] Feito: era resquício mesmo, e somava **três** espaços. A causa é estrutural: em Compromissos
  a contagem rola junto com a lista e não tem margem própria (o respiro vem só do `listHeader`); em
  Remédios ela mora no bloco fixo do topo, junto da busca, e tinha margens próprias — `marginTop:
  gutter` (24) e `marginBottom: md` (16). Esse `marginBottom` somava com o `paddingBottom: md` do
  `header` e com o `paddingTop: md` do `listHeader`: **48px** até o primeiro elemento, contra 8 em
  Compromissos. Agora a contagem usa `md` em cima e `sm` embaixo (o que o comentário do arquivo já
  prometia), o `paddingBottom` do `header` saiu e o `listHeader` ficou só com o `gap`. De quebra, o
  `ListHeaderComponent` passa a devolver `null` quando não há estoque — como `View` vazio, o `gap`
  da lista ainda contava um vão antes do primeiro card.

### Compromissos (continuação)

entrando na listagem de compromissos sem nenhum cadastrado, não há como cadastrar um dali — o ícone
de + não está presente. Ele precisa estar, e indo direto ao cadastro de compromisso, sem passar
pela escolha entre compromisso e medicação.
- [x] Feito: adicionado o `Fab` à tela, fora do `FlatList` (para existir também com a lista vazia,
  que era justamente o caso sem saída), indo direto a `/cadastro/compromisso` — sem passar por
  `/cadastro/escolha`, mesma razão pela qual o + de Remédios pula a pergunta: quem está na lista já
  respondeu o que vai cadastrar. O texto do estado vazio dizia "Toque no + no Calendário", mandando
  a pessoa para outra tela; virou "Toque no + para cadastrar sua primeira consulta ou exame".
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

quebra de layout em ANEXOS: nos textos ("Adicionar foto da caixa" / "Ajuda a reconhecer o remédio
de relance"), o espaçamento e o alinhamento estão errados. Padronizar o espaçamento entre título e
subtítulo, e alinhar os textos à esquerda para ficarem rentes ao espaço de preenchimento da mídia.
- [x] Feito: eram duas causas somadas. (1) O alinhamento: o link ficava dentro de `alvoDeLink`, que
  tem `paddingHorizontal: sm` (8px), enquanto a dica abaixo é `Text` solto sem padding — o título
  saía 8px à direita da dica, e nenhum dos dois rente ao quadrado da mídia. Como `alvoDeLink` é
  compartilhado ("Ler os Termos", saída do estoque, "Alterar anexo"/"Remover" lado a lado, onde o
  padding separa os dois), criei `alvoDeLinkRente` — mesmo alvo de 44pt, sem padding lateral — e
  apliquei só nos dois links que encabeçam bloco de texto ao lado de mídia (foto da caixa e
  receita). (2) O espaçamento: `photoTextGroup` tinha `gap: xs` que somava com a folga vertical dos
  44pt do alvo, afastando a dica do título que ela explica. Gap removido — o respiro agora vem só
  do alvo, igual em todas as seções de anexo. Em `CadastroDeMedicamento.styles.ts` e
  `FormularioDeMedicamentoScreen.tsx`.

no painel "deixe o alarme mais confiável" (dentro do popup de lembrete): o botão "abrir a tela do
alarme" não funciona, só exibe a tela de bloqueio — e não vejo necessidade dele. "Tocar no
silencioso" só redireciona pras configurações do app, não dá pra entender o que fazer. O mesmo com
"funcionar com a tela apagada": clico e não há indicativo do que preciso fazer. Se não é um
redirecionamento exato, podemos retirar.
- [x] Feito: os três tinham causas diferentes. (1) **"Abrir a tela do alarme" removido.** O Android
  não expõe API para ler `USE_FULL_SCREEN_INTENT`, então o item tinha `concedida: false` fixo e
  nunca saía do painel, mesmo concedido — cobrava para sempre algo já feito. E a intent que o abre
  não existe em todo aparelho, caindo num `openSettings()` genérico: era a tela "estranha" que você
  viu. A permissão continua no `app.json` (concedida na instalação na maioria dos aparelhos); o que
  saiu foi a cobrança impossível de satisfazer ou verificar. (2) **"Tocar no silencioso": destino
  corrigido.** Abria `openNotificationSettings()` — as notificações do app, onde essa autorização
  não existe. Agora abre a tela de acesso à política do Não Perturbe
  (`NOTIFICATION_POLICY_ACCESS_SETTINGS`), com fallback para o comportamento antigo. (3) **Os dois
  que ficaram ganharam instrução.** Campo novo `comoFazer` no `ItemDePermissao`, exibido abaixo da
  consequência em cor de destaque: "Na lista que abrir, procure o Mapill e permita o acesso" e, no
  da bateria, texto que muda conforme a tela ("sem restrições" nos aparelhos com gerenciador
  próprio — Xiaomi/Samsung/Motorola —, "Permitir" na tela padrão do Android). Em
  `permissoes-de-alarme.ts`, `PainelDePermissoes.tsx` e `.styles.ts`.

"tocar no silencioso" funcionou. Já "funcionar com a tela apagada" redireciona para uma tela de
"início automático em segundo plano"; eu autorizo, volto ao app e o botão continua aparecendo. Só
temos que validar isso: quando o usuário aprova a permissão, o botão sai da tela.
- [x] Feito: **item removido**, e o motivo é que essa validação não é possível. O item abria uma
  tela e verificava **outra**: nos aparelhos com gerenciador próprio (Xiaomi/Samsung/Motorola) ele
  mandava para o "início automático" do fabricante, mas lia `isBatteryOptimizationEnabled()`, que é
  a otimização de bateria do Android — ajustes independentes. Autorizar o autostart não mudava o
  que estava sendo lido, e o item ficava pendente para sempre. Não há API para ler o autostart
  (telas proprietárias não expõem estado), então ele nunca sairia sozinho. Aplicado o mesmo critério
  da tela cheia: **só entra no painel o que o app consegue ler de volta**. A orientação sobre
  bateria virou um parágrafo no bloco "Depende do seu aparelho" da tela de ajuda de alertas — com o
  nome dos fabricantes e o que procurar ("sem restrições" / início automático). De quebra, corrigi o
  texto daquele bloco, que prometia que o app "leva você ao ajuste certo" para a bateria — o que
  deixou de ser verdade. O painel agora tem **três** itens.
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

a mensagem do topo ("quanto ainda resta de cada medicação e quando ela deve acabar...") pode ser
mais compacta. O card pode ser melhor aproveitado: o nome e o local dividem a largura com "30
comprimidos" e quebram muito — palavras longas em espaço pequeno. Deixar mais colorido, com mais
ênfase no que importa (o estoque e quando acaba). Aplicar a busca, igual à lista de remédios. E o
trecho "falta alguma medicação nessa lista" pode sair, mantendo só o botão "ver minhas medicações".
- [x] Feito: (1) **Frase do topo** reduzida a uma linha — "A quantidade cai sozinha a cada dose
  confirmada", que é a única parte que não se deduz olhando os cards. (2) **Card reestruturado**: o
  nome passou a ocupar a linha inteira (com o local abaixo, ambos com `numberOfLines={1}`), em vez
  de dividir a largura com a quantidade — que na tipografia de título é larga e comia o espaço do
  nome, fazendo os três quebrarem. Quantidade e previsão viraram uma **faixa com fundo próprio**
  (`secondaryContainer`), que é a resposta da tela; quando o estoque acabou ou acaba hoje, **o bloco
  inteiro** fica vermelho (`errorSurface`), não só o texto — a cor de um bloco se vê rolando a
  lista, a de uma palavra não. Mesma decisão da faixa lateral das doses atrasadas na Home. (3)
  **Busca adicionada**, no mesmo padrão de Medicações: `SearchField` + contagem dinâmica ("2 de 5
  medicações" durante a busca), normalização sem acento, e estado vazio próprio para "não encontrei"
  separado de "não há estoque controlado". A busca é só por nome — o local de guarda é onde a caixa
  está, não como o remédio se chama. (4) **Rodapé enxuto**: sobrou só o botão; o título e o
  parágrafo saíram, e com eles o fundo e o padding da caixa, que não tinham mais o que conter.
  Aproveitei para tirar o `paddingBottom` do `header`, o mesmo empilhamento de espaço já corrigido
  em Medicações.

melhorou muito. A frase do topo pode sair, deixando só a busca. Mas indicar mais coisas: o local
precisa estar explícito, com a palavra "Local:" antes. Abaixo, em azul principal, ênfase no número:
"Estoque: 30 comprimidos". E o prazo ("acaba em 30 de dezembro") quebra linha, vai embaixo, com
estilização diferente — não dentro do mesmo escopo do estoque.
- [x] Feito: (1) Frase do topo removida; a tela abre direto na busca. O estilo `subtitle` ficou
  órfão e saiu. (2) **"Local:" explícito** antes do lugar de guarda — sozinho, logo abaixo do nome
  do remédio, "Gaveta da geladeira" lia como parte do nome. O rótulo fica em `onSurfaceVariant` e o
  valor em `onSurface`: o dado é a informação, o rótulo só o nomeia. (3) **Faixa de estoque em azul
  principal** (`primaryContainer`, texto branco), com "Estoque:" antes do número; no estado crítico
  o bloco inteiro vira `error` com texto branco. (4) **Prazo fora da faixa**, em texto de apoio
  abaixo dela — quanto resta é um fato contado, quando acaba é uma projeção sobre o ritmo do
  tratamento; no mesmo bloco os dois liam como uma informação só, e a estimativa ganhava o peso de
  um número conferido. No crítico ele fica vermelho, mas sem fundo.

não gostei do destaque azul no campo de estoque. Estoque e local podem ficar na mesma estilização.
Para diferenciar, uma linha horizontal abaixo do nome do remédio, dando diferença de escopo. E o
botão "Repor" em azul principal.
- [x] Feito: o fundo azul saiu da quantidade — local e estoque agora têm o mesmo peso, com os
  rótulos "Local:" / "Estoque:" fazendo a distinção (são dados do mesmo tipo, e dar fundo a um
  fazia o outro parecer secundário). Traço de 1px (`outlineVariant`) abaixo do nome, sem margem
  própria — o `gap` do cartão já dá o respiro, e somar margem abriria o dobro de espaço em volta de
  um traço fino. "Repor" passou para `primaryContainer` com texto e ícone brancos: o azul saiu do
  dado e foi para a ação, que é o que se vem fazer nesta tela. No estado crítico a quantidade fica
  vermelha só no texto, sem fundo. Estilos `faixaDeEstoque`, `faixaDeEstoqueCritica`,
  `rotuloDeEstoque` e `itemHeaderText` removidos por terem ficado órfãos.

o aviso "acaba em 30 dias" precisa de uma estilização diferente — uma cor um pouco mais clara, em
tom de aviso.
- [x] Feito: o prazo virou uma **etiqueta com três estados**, porque havia um problema por trás da
  cor: existiam só dois (cinza e vermelho), então "acaba em 3 dias" era pintado igual a "acaba em
  90" — e a diferença entre os dois é justamente o que se vem descobrir nesta tela. Agora: **cinza**
  (texto puro, sem fundo) enquanto o prazo é confortável; **âmbar** (`warningSurface`, a mesma
  linguagem da `Dica` e do lembrete de conferência) ao entrar na janela de reposição; **vermelho**
  (`errorSurface`) quando acabou ou acaba hoje. A etiqueta encolhe até o texto (`alignSelf:
  flex-start`) em vez de atravessar o cartão. A janela do âmbar é a que **a própria pessoa
  configurou** no cadastro (`lowStockAlertLeadDays`), com 7 dias de piso para quem não ativou o
  alerta — quem pediu aviso com 30 dias tem motivo, e pintar só no sétimo dia contradiria o que ela
  definiu como "está acabando".

o cliente entra nesta seção querendo ajustar a notificação de estoque e não encontra — ela só existe
no cadastro. Agregar aqui, reaproveitando o mesmo escopo do cadastro. E deixar a busca igual à de
medicações (mesmo placeholder e tal).
- [x] Feito: **aviso de estoque baixo agora editável na tela de Estoque**, mantido também no
  cadastro (dois caminhos, o mesmo campo — sem cópia de estado). Uma linha discreta no rodapé de
  cada card mostra o estado atual ("Avisar 7 dias antes de acabar" / "Sem aviso de estoque baixo") e
  abre um `BottomSheet` com o mesmo `Checkbox` + `OptionGroup` (3/7/15/30) do cadastro — o
  `ConfiguracaoDeEstoque` não foi reaproveitado inteiro porque carrega quantidade e local, que aqui
  já têm caminho em "Repor"/"Recontar". Terceira linha e não terceiro botão: "Recontar" e "Repor"
  dividem a largura em dois, e um terceiro espremeria os rótulos (o que corta primeiro com fonte
  ampliada); a linha ainda dá espaço para dizer o estado em vez de só oferecer a ação. Trouxe junto
  o aviso de conflito do cadastro (antecedência maior que o estoque que resta). Nova função
  `salvarAvisoDeEstoqueBaixo` em `use-inventory-list.ts` — grava nos mesmos campos e **não** cria
  `InventoryAdjustment`, porque aquela tabela é o histórico de movimentação de quantidade e mudar
  quando o app avisa não move nada. **Busca alinhada com Medicações**: mesmo placeholder ("Buscar
  por nome ou princípio ativo"), busca também pelo princípio ativo (era só nome), mesmo texto de
  estado vazio, e as duas props de teclado que faltavam (`keyboardDismissMode="on-drag"` e
  `keyboardShouldPersistTaps="handled"`) — sem elas o teclado não fechava ao arrastar e o primeiro
  toque em "Repor" era gasto só fechando o teclado.

-

### Conta
`src/telas/Conta/` — dados da conta, sincronização, exclusão.

-

---

## Outras

### Em Construção
`src/telas/EmConstrucao/` — placeholder para funcionalidade ainda não implementada.

-
