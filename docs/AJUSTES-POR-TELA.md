# Ajustes por tela

Documento de trabalho. O Gabriel navega pelo app e anota, tela por tela, o que quer mudar —
cada apontamento vira uma execução exata, sem extras.

**Como preencher:** escreva o pedido como um item de lista dentro da seção da tela. Quando eu
terminar, marco `[x]` e registro numa linha o que foi feito, para o histórico não se perder.

```
- [ ] Diminuir o espaço entre os cards da lista
```

---

## ⏳ Pendente para o refinamento

**Revisar os quatro temas.** A revisão desta rodada foi feita e aprovada no **tema padrão**. Os
outros três — escuro, alto contraste e daltonismo — receberam os tokens novos (`successVivo`,
`errorVivo`, `errorPreenchido`) com valores calculados e conferidos por contraste, mas **não foram
vistos em aparelho**. Vale percorrer as telas nos três antes de fechar o TCC.

Dois pontos que já se sabe que merecem olhar:

- O **daltonismo** troca verde/vermelho por turquesa/magenta de propósito, então tudo que foi
  decidido por "cor de semáforo" nesta rodada se comporta de outro jeito lá.
- O **alto contraste** foi de onde saiu o `#9E0008` que virou o vermelho preenchido do tema padrão.
  Vale conferir se o tema não ficou com dois vermelhos iguais onde antes havia hierarquia.

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

### Termos [x]

**[x] Feito: os acordeões legais ganharam fundo branco.** "Termos de Uso" e "Política de
Privacidade" usavam o `surfaceContainerLow` padrão do `Accordion`, quase igual ao fundo da tela —
certo dentro de um fluxo de texto longo, errado aqui, onde eles são os únicos blocos tocáveis abaixo
de um cartão branco. O único elemento clicável da tela era o que menos parecia clicável. Passou a
`surfaceContainerLowest`, via a prop `style` que o `LegalAccordion` agora repassa ao `Accordion`.
`src/telas/Termos/` — texto legal (Termos de Uso / Política de Privacidade).
Tela de termos está perfeita, tudo ok
-

---

## Abas principais

### Início (Home)
`src/telas/Inicio/` — agenda do dia, progresso, cards de estoque/adesão.

são 19:35 e três remédios (19:31, 19:33, 19:34) aparecem VERDE marcando "agora" — não é o correto.
O card azul da próxima dose não aparece. Os botões "Confirmar" e "Pular" devem ficar lado a lado
(Confirmar à direita). O card do medicamento precisa de espaçamento melhor e um background que o
diferencie, com detalhe na cor do tema (verde/vermelho). E a Home deveria ter os compromissos do
dia. (Sobre o "Confirmar todas": apareceu depois da correção, mas não considero necessário.)
- [x] Feito: (1) **Tolerância de 30 → 5 min.** A janela do "É AGORA" ia até 30 minutos *depois* do
  horário — por isso as três de 19:31–19:34 ficavam verdes às 19:35, e só virariam vermelhas às
  20:01. Verde é a cor que menos pode enganar num app de medicação, porque diz "está tudo em ordem".
  Simulei a progressão: agora às 19:40 as três já estão atrasadas. *(A Home já recarregava a cada
  minuto — cheguei a suspeitar disso, mas o mecanismo estava certo; era a janela mesmo.)* (2) **Card
  azul de volta.** Uma dose "now" marcava `proximaMarcada = true`, e aí nenhuma dose futura recebia
  o status `next` — qualquer dose na janela apagava o card da tela. São perguntas diferentes: a
  verde já está na agenda pedindo ação, o card do topo responde "e depois desta, o que vem?". (3)
  **Botões lado a lado**, Pular à esquerda e Confirmar à direita (ordem Cancelar/OK do sistema).
  Junto: o cartão passou a **empilhar** — ele era `flexDirection: row`, então os botões ficavam ao
  *lado* do texto e o espaço do nome do remédio dependia da largura da palavra "Confirmar". (4)
  **Fundo com corpo**: `successSurface`/`errorSurface` são quase brancos e não diferenciavam nada
  num cartão que já é branco. Mesmo `misturarCores` do painel de permissões, 10% da cor de estado —
  verde `rgb(210,233,218)`, vermelho `rgb(247,214,213)`. Proporções iguais de propósito: "é agora" e
  "atrasada" pedem ação igualmente, e pesos diferentes diriam algo que a semântica não diz. Mais
  `gap` entre hora/status e nome/dose, e alinhamento pelo topo (centralizados, um deslizava em
  relação ao outro quando o texto crescia). (5) **Compromissos do dia** na Home, em bloco próprio
  depois das doses — novo `ItemDeCompromisso`. Sem botões e sem cor de urgência: não há o que fazer
  no app na hora da consulta, e "você foi?" só faz sentido depois, o que já existe no Calendário.
  Filtro por dia local (`toLocalIsoDay`), senão uma consulta das 21h cairia no dia seguinte. O
  estado vazio da agenda também mudou: com compromisso no dia, "não há nada hoje" seria falso.

o aviso de "Dia completo" não fica por cima da barra de navegação na base.
- [x] Feito **e confirmado em aparelho (05/09)**: o comentário do estilo prometia "cobre a tela
  inteira, inclusive a barra de abas", mas `position: absolute` cobre apenas **o pai** — e a Home
  vive dentro do navegador de abas. A barra ficava por cima, à mostra e tocável durante a animação,
  exatamente o que aquele comentário dizia estar evitando. Virou `Modal`, que renderiza acima de
  toda a árvore, com `statusBarTranslucent` para cobrir o topo, `transparent` (quem pinta o fundo é
  o overlay, que precisa esmaecer junto) e `animationType="none"` (a entrada e a saída são do
  Reanimated — duas animações se sobreporiam). Beneficia também o cadastro de medicamento e o de
  compromisso, que usam o mesmo componente.

o card do medicamento na Home não pegava o background branco — várias tentativas sem efeito.
- [x] Feito: a causa não era o estilo, era o **componente**. O `CardAdesaoSemanal` (que aparecia
  certo) é um `Pressable` comum; o `ItemDeDose` é um `AnimatedPressable` do Reanimated 4 com `style`
  como **função** — a assinatura que o `Pressable` exige para saber se está pressionado. Nessa
  combinação o `boxShadow` do `superficieDeCartao` (propriedade CSS-style nova do RN 0.86) não era
  aplicado, e o cartão saía sem fundo e sem sombra. Por isso trocar cor, token ou limpar cache não
  resolvia. Separei por responsabilidade: uma `View` comum desenha o cartão (fundo, canto, sombra,
  faixa de estado) e o `AnimatedPressable` cuida só da opacidade animada e do toque. No caminho
  apareceu outro defeito: "Confirmar"/"Pular" estavam **dentro** do Pressable do cartão, então numa
  dose resolvida o toque neles atravessaria para a correção retroativa — agora são irmãos.

diminuir os botões confirmar/pular, e centralizar o horário na vertical.
- [x] Feito: caixa dos botões de 44 → 36, texto `label` → `caption`, padding menor; os 44 de alvo
  real voltam por `hitSlop` — encolheu o desenho, não a área que o dedo alcança. O horário exigiu
  duas mudanças: `justifyContent: center` na coluna só funciona se ela tiver altura para distribuir,
  então o pai passou de `alignItems: flex-start` para `stretch`. O ganho aparece quando o nome do
  remédio quebra em duas linhas — antes a hora ficava pendurada no topo.

**[x] Feito: o compromisso passou a aparecer na Home quando o lembrete dispara, e não só no dia.**
Um compromisso para daqui a 5 dias com lembrete pedido para hoje mandava a notificação e a Home não
confirmava nada — a pessoa era avisada de algo que o app, na tela principal, fingia não ter.

A regra: **a antecedência do lembrete é a janela do card.** `reminderLeadDays: 7` põe o compromisso
na Home nos 7 dias que antecedem a consulta. Assim a notificação e a tela nunca discordam, porque
leem o mesmo número, e uma consulta marcada com três meses de antecedência não ocupa a Home por três
meses — ela é a tela do **dia**, e o que não é acionável hoje empurra as doses para baixo.

O próprio dia é a exceção e entra sempre, com ou sem lembrete: quem não pediu aviso dispensou a
*antecedência*, não dispensou ver a própria agenda quando ela chega. Isso preserva o comportamento
que a tela já tinha. Passada a data o card sai, mesmo sem resposta — a Home mostra o que ainda dá
para fazer, e cobrar desfecho de ontem competiria com as doses de hoje pelo mesmo espaço.

Os que ainda não são hoje ficam num bloco "Se aproximando", separado do de hoje: juntos, a consulta
de daqui a cinco dias leria como coisa do dia e faria a pessoa se preparar hoje.

**[x] Feito: "Se aproximando" virou card próprio (`CardCompromissoProximo`), não mais uma linha.** A
primeira versão reusava a linha da agenda de hoje, e ela não tem onde colocar o **preparo** — que é
a única informação do compromisso a exigir ação antecipada. Descobrir "jejum de 12h" só ao abrir o
detalhe é descobrir tarde; um aviso disso cinco dias antes é o que evita a consulta perdida por ter
tomado café. No card ele tem faixa própria, abaixo de um traço.

Estética própria, e **não** o azul cheio do card de próxima dose: aquele é a única quebra da paleta
neutra da Home, e um segundo azul não somaria destaque — dividiria o que existe, e a dose perderia a
vaga que a torna a próxima coisa a fazer. Aqui a presença vem da barra lateral de 4px e do bloco de
data 52×52, que é a assinatura visual do compromisso na listagem: quem já viu a lista reconhece o
card antes de ler. No dia, barra e bloco viram **verdes**, o mesmo sinal de "é agora" do cartão de
dose.

O toque abre a listagem **já com o detalhe daquele compromisso** (`/compromissos?detalhe=<id>`), e
não a lista inteira: quem tocou já escolheu qual, e reencontrá-lo lá dentro anularia o atalho. Na
tela, a intenção da rota semeia o mesmo estado que o toque na lista alimenta — com uma trava de "já
usado", senão fechar o popup e ter a lista recarregada o reabriria, e ele ficaria impossível de
dispensar.

Regra em `src/domain/use-cases/compromissos-a-mostrar-na-home.ts`, com 13 verificações em
`scripts/conferir-compromissos-na-home.mjs` (janela exata, consulta a 90 dias, o dia sem lembrete, o
que já passou, e `emDias` contando dias de calendário e não períodos de 24h).

**[x] Feito: "Minha adesão" virou rótulo de seção.** No mesmo nível de "Se aproximando" e "Estoque",
para a Home ter uma leitura de índice em que cada assunto se anuncia antes de aparecer. O título
**dentro** do card continua "Acompanhamento semanal", que descreve o gráfico — são coisas
diferentes, e cheguei a trocá-lo por engano antes de entender o pedido. A chamada do rodapé virou
"Ver o relatório completo", dizendo o que mais existe lá dentro (o dia a dia e o PDF da consulta).

**[x] Feito: a pílula azul da aba ativa saiu.** Três pistas para o mesmo estado — ícone azul, rótulo
azul e um bloco de cor atrás do ícone — eram uma a mais, e a pílula era a que menos dizia: sendo
área preenchida, competia com o azul da tinta em vez de reforçá-lo. O `indicatorColor` continua
declarado como `transparent`, e não removido: sem ele o Android pinta a pílula com a cor dinâmica do
Material You, que vem do papel de parede do aparelho (no teste saiu verde).

**[x] Feito: os atalhos viraram botões de contorno, com só o título.** "Gerenciar estoque" e "Ver
compromissos" — o subtítulo saiu dos dois porque repetia o rótulo da seção logo acima, e a contagem
que ele carregava não muda o destino do toque. De três linhas para uma.

O estilo também mudou: fundo branco como os cartões (para o atalho seguir na mesma família visual da
tela), mas com **borda azul e sem sombra**. Sombra é o que faz uma superfície parecer *conter* algo,
e aqui não há conteúdo, há um caminho — sem essa distinção, a seção de estoque exibia dois blocos
idênticos, um que informa e outro que leva a outro lugar. Texto e seta em azul, ícone de 44 para 34
(numa linha de altura única o círculo grande dominava o texto).

**[x] Feito: marca-d'água nos cards cheios.** Ícone gigante girado e cortado no canto inferior
direito (opacidade 0.12–0.13), atrás do conteúdo — a pílula no card azul de próxima dose, o triângulo
de alerta no vermelho de estoque. Some do leitor de tela: repete o ícone do rótulo, e anunciá-la
seria dizer a mesma coisa duas vezes. Junto veio o selo quadrado do ícone no rótulo e o ícone ao lado
da orientação de tomada. É composição, não informação — a opacidade é baixa justamente para que o
horário, que é o que o card existe para mostrar, não tenha com o que competir.

**[x] Feito: os cards soltos viraram seções com rótulo.** "Compromissos agendados" estava no meio
dos cards de estoque, longe do bloco "Se aproximando" que fala do mesmo assunto; e o alerta de
estoque baixo ficava separado do acesso à listagem, então quem via "acaba em 3 dias" precisava
procurar onde repor.

Agora o card de compromissos entra **dentro** de "Se aproximando" (e o rótulo vira só "Compromissos"
quando não há nada chegando, para não prometer o que a seção não tem), e o estoque ganhou seção
própria: o alerta primeiro, porque é o que pede ação, e o acesso à listagem logo abaixo, que é para
onde se vai em seguida.

**[x] Feito: mais respiro no topo.** O cabeçalho ganhou `lg` (32) acima da data — sem isso ela
nascia colada na barra fixa, como se fosse parte dela. Entre a saudação e o progresso, `gutter` (24)
no lugar de `md` (16): são duas informações diferentes, e apertadas liam como um bloco só de texto.
A data subiu para `sm` do nome (era `xs`), e o bloco de progresso para `md` — a barra é o que se lê
de relance e precisa de ar em volta para funcionar como medidor. O topo é a única parte da tela que
ninguém precisa procurar, então é onde cabe gastar altura.

**[x] Feito: verde e vermelho de semáforo, em três intensidades.** O verde `#0F7038` parecia
verde-garrafa e o vermelho `#C4141C` lia como vinho — ele ficava em **357°**, do lado do roxo, e era
isso (não a saturação) que dava a impressão de rosa.

A saída foi separar por **papel**, porque a régua de contraste muda conforme o uso:

| token | valor | onde | régua |
|---|---|---|---|
| `errorVivo` | `#FF0000` | ícones, faixas, bordas | 3:1 (forma) — dá 4.00:1 |
| `errorPreenchido` | `#E60000` | fundo do card de alerta | o **branco por cima** precisa de 4.5 — dá 4.81:1 |
| `error` | `#C90000` | texto ("Estoque zerado") | 4.5:1 — dá 6.03:1 |
| `successVivo` | `#12963F` | ícones e faixas | 3.45:1 na pior superfície |
| `success` | `#11803E` | texto ("TOMADA") | 5.02:1 |

Os três vermelhos partilham o **matiz 0°**: são a mesma cor em intensidades diferentes, e é o que
faz o app parecer ter um vermelho só. O `errorSurface` acompanhou (`#FDECEA` → `#FDEAEA`), senão
puxaria para o salmão sob o vermelho puro.

Três lugares onde o vivo **não** coube, todos medidos: verde grama de catálogo (`#22C55E`) dá 2.28:1
e some até como ícone; `#FF0000` como fundo deixa o texto branco em 4.00:1; e `#FF0000` como texto
também reprova. Daí os três tokens.

**[x] Feito: os rótulos de estado passaram a usar os tokens de texto.** "ATRASADA" e "É AGORA" usavam
`onErrorContainer`/`onSuccessContainer` — tokens calibrados para ficar **sobre o container cheio**,
quase pretos (9.9:1) e em outro matiz (356°). Sobre o cartão branco davam um vermelho escuro que não
se parecia com a faixa lateral a um centímetro dali. O mesmo defeito estava na previsão crítica do
Estoque e no "HOJE" do card de compromisso. Onde o container existe de verdade (selos, painel de
permissões), o token continua correto.

Só o tema padrão mudou de tom. Os outros três têm razões que não são estéticas: o **daltonismo** usa
turquesa/magenta de propósito, o **alto contraste** escurece para atingir razões maiores, e o
**escuro** precisa de tons claros sobre fundo escuro — mas os três ganharam os tokens novos.

**[x] Feito: as doses já registradas viraram lista compacta, no formato do Calendário.** Em cartões,
o efeito era perverso: quanto mais em dia a pessoa estivesse, **mais cheia** ficava a Home — cinco
doses tomadas ocupavam mais tela que as que ainda faltam, empurrando o que ainda espera resposta
para longe.

As duas listas respondem perguntas diferentes. A de cima pergunta "o que falta?" e precisa de
botões, cor e área de toque generosa. Esta responde "o que eu já fiz?" — é conferência, e quem
confere varre a coluna de horários em vez de ler cartão por cartão. Então virou um cartão só com
divisórias internas, hora em coluna fixa de 44, ícone de desfecho à direita e `opacity: 0.55`, tudo
igual à agenda do Calendário, onde esse enxugamento já tinha dado certo.

O toque em cada linha continua abrindo a correção retroativa: encolher o registro não pode custar a
chance de corrigir um "pulei" que era "tomei". A cascata de entrada passou a contar o bloco como
**um** item, e não uma por dose — senão os compromissos abaixo herdavam um atraso proporcional ao
número de doses já tomadas.

**[x] Feito: card "Compromissos agendados", levando à listagem.** Os cards acima mostram o que está
próximo; este responde "e a consulta de novembro, o app guardou?". Sem ele, a janela do lembrete —
que é o que mantém a tela do dia enxuta — viraria a sensação de que o compromisso se perdeu. Some
quando não há nada à frente, como o card de estoque: um convite para uma tela só com histórico
promete mais do que entrega. Reusa os estilos do `CardEstoque`, que é a mesma anatomia e a mesma
função.

**[x] Feito: o cadastro passou a dizer que o lembrete governa o card.** O texto de ajuda da seção de
avisos ganhou uma frase sobre a tela inicial, variando com o que foi escolhido ("nos 7 dias que
antecedem a data" / "no próprio dia"). Sem isso, um card que surge sozinho dias depois parece
comportamento aleatório do app.

### Calendário
`src/telas/Calendario/` — grade do mês, agenda por dia.

**[x] Feito: o dia selecionado deixou de ter um quadrado atrás.** O círculo do número sempre esteve
correto (`radius.full`); o quadrado era o **ripple** do Android, desenhado no `Pressable` — que é a
célula retangular da grade, não o círculo. Com `android_ripple={null}` ele some, e o retorno do
toque passa a ser a opacidade do próprio círculo, que segue a forma dele.

**[x] Feito: o card de compromisso ganhou a barra lateral do card da Home.** É a assinatura visual
do compromisso no app — quem viu o "Se aproximando" reconhece a linha aqui sem ler. O bloco de data
daquele card **não** veio junto: lá ele responde "quando?", e aqui o cabeçalho do dia já respondeu.
As ações (editar, excluir) e a resposta de desfecho continuam só desta tela — a Home informa, o
Calendário administra. Compromisso passado perde a cor da barra junto com a opacidade.

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

**[x] Feito: mais respiro no topo da lista.** `lg` (32) acima da contagem e entre o botão de estoque
e o primeiro card, no lugar do `md` (16). A busca é um campo que se opera e a lista é conteúdo que
se lê — com o mesmo espaço de um item de lista, o botão de estoque lia como o primeiro remédio.
Compromissos recebeu o mesmo, porque são a mesma lista em abas diferentes.

**[x] Feito: a contagem desceu para junto da lista.** Ela vivia no bloco fixo do topo, entre a busca
e o seletor de ordem — e ali parecia legenda dos **controles**, não da lista. Passou para o
`ListHeaderComponent`, abaixo do atalho de estoque e encostada no primeiro card, que é o que ela
descreve. Rola junto com a lista, como o atalho: os dois se lê uma vez, e parados no topo custariam
altura em toda rolagem. Fixos ficam só a busca e o seletor, que são o que se opera.

**[x] Feito: o botão de estoque virou o mesmo `CardEstoque` da Home.** Eram dois atalhos para a
mesma tela com desenhos diferentes — um `Button variant="outline"` aqui, um card lá —, e isso fazia
o app parecer ter dois caminhos distintos até o estoque. O componente saiu de
`telas/Inicio/componentes/` para `ui/CardDeAtalho/`, que é onde mora o que serve a mais de uma tela.

**[x] Feito: o seletor de ordem mostra todas as opções de uma vez.** A fileira rolava na horizontal,
e isso escondia opções atrás de um gesto que nada anunciava: quem não arrastasse não sabia que
"Acabando" existia. Um seletor com opção invisível não é um seletor.

Cabem todas porque duas coisas saíram: o **ícone** (nenhum dos três rótulos tem símbolo que
signifique algo sozinho — eram largura sem leitura) e um degrau de fonte (`label` 12px → `caption`
10px). As fichas passaram a dividir a largura em partes iguais com `flex: 1`, então a fileira fica
alinhada em vez de ter larguras ditadas pelo tamanho de cada palavra. Vale para todas as telas que
usam o componente.
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

### Compromissos (continuação) [x]

entrando na listagem de compromissos sem nenhum cadastrado, não há como cadastrar um dali — o ícone
de + não está presente. Ele precisa estar, e indo direto ao cadastro de compromisso, sem passar
pela escolha entre compromisso e medicação.
- [x] Feito: adicionado o `Fab` à tela, fora do `FlatList` (para existir também com a lista vazia,
  que era justamente o caso sem saída), indo direto a `/cadastro/compromisso` — sem passar por
  `/cadastro/escolha`, mesma razão pela qual o + de Remédios pula a pergunta: quem está na lista já
  respondeu o que vai cadastrar. O texto do estado vazio dizia "Toque no + no Calendário", mandando
  a pessoa para outra tela; virou "Toque no + para cadastrar sua primeira consulta ou exame".

**[x] Feito: busca por consulta, profissional ou local.** Mesma anatomia da busca de medicamentos
(`SearchField`, contagem "X de Y" no lugar do total, teclado dispensado ao arrastar). Os três campos
porque são as três formas de lembrar de uma consulta — pelo que é ("cardiologista"), por quem atende
("Dra. Helena") ou por onde é ("Clínica São José") — e quem procura raramente lembra qual dos três
digitou no cadastro. Exigir o campo certo transformaria a busca num quiz.

A função `normalizar` (minúsculas sem acento) saiu de dentro de `RemediosScreen` para
`src/shared/normalizar-busca.ts`: era a segunda tela a precisar dela, e a terceira cópia é onde
essas coisas começam a divergir.

**[x] Feito: os passados viraram um acordeão "N anteriores" no fim da lista.** A dúvida era entre
riscar, sumir ou manter. Nenhuma das três: compromisso concluído é **registro clínico** — "fui ao
cardiologista em março, ele pediu hemograma" é exatamente o que `outcomeNotes` guarda, e é o que se
leva à consulta seguinte. Sumindo, o app perde o histórico que promete; riscado, fica ilegível. Mas
ele também não pode competir com o que ainda vai acontecer, que é o motivo de alguém abrir a tela.

Então próximos abertos em cima, anteriores dobrados embaixo com a contagem no título — o mesmo
padrão das doses não tomadas na tela de adesão. O acordeão recebe a superfície de cartão pelo mesmo
motivo de lá: o fundo padrão dele quase empata com o da tela.

**[x] Feito: traço horizontal separando a agenda do histórico.** O respiro sozinho não bastava: numa
lista de cartões iguais, espaço a mais lê como item que falta, não como troca de assunto. O traço
diz que ali termina "o que vem" e começa "o que foi". Só aparece quando há algo acima para separar.

**[x] Feito: a contagem do topo conta só os próximos.** Ela descreve a lista logo abaixo dela, e ali
estão apenas os que ainda não passaram — o histórico tem a própria contagem no título do acordeão.
Com dois cadastrados sendo um já realizado, "2 compromissos cadastrados" acima de um único cartão
visível parecia erro. Virou "1 compromisso agendado". Durante a busca o denominador do "X de Y"
segue a mesma regra, pelo mesmo motivo.

Com isso, a linha "Nenhum compromisso à frente" saiu: a contagem já diz "0 compromissos agendados",
e repeti-lo num bloco próprio seria dizer duas vezes o mesmo.

**[x] Feito: espaçamento da contagem igualado ao de Remédios** (`md` acima, `sm` abaixo), com o
`listHeader` perdendo o padding próprio — somados, os dois criavam no topo um vão que nenhuma das
duas telas tem.

**[x] Feito: placeholder da busca encurtado para caber numa linha.** "Buscar por consulta,
profissional ou local" quebrava e desalinhava a caixa; virou "Buscar compromisso". A busca continua
olhando os três campos — o texto é convite, não especificação.

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

as sugestões ao digitar o nome do remédio: limitar a três ou quatro opções, deixar o card menor
para otimizar espaço, e retirar aquelas bordas esquisitas.
- [x] Feito: (1) **`MAX_SUGESTOES` de 6 → 4** em `use-medication-catalog.ts` — a lista abre logo
  abaixo do campo com o teclado ocupando metade da tela, e seis linhas cobriam o próprio campo que
  estava sendo digitado. *(O bloco 12.9-E do roteiro já pedia "4 sugestões, não 6" — a mudança
  estava prevista e nunca tinha sido aplicada no código.)* (2) **Bordas removidas**: eram duas — o
  contorno do bloco e uma linha no topo de cada item —, e juntas desenhavam uma grade de caixas, a
  gramática de formulário HTML que o resto do app já abandonou. Virou um bloco `surfaceContainerLow`
  sem contorno, com os itens separados por espaçamento. (3) **Card menor**: linha de 52 → 40, texto
  `bodyLg` → `bodyMd`, ícone 18 → 16 — com quatro sugestões a lista inteira ocupa menos altura que
  três itens ocupavam antes. O alvo de toque volta aos ~48 por `hitSlop`, e as linhas ganharam
  feedback de toque, que não tinham.

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

o espaçamento abaixo de "Adicionar foto da caixa" e "Adicionar arquivo" está muito grande. E ao
clicar sobre eles aparece um efeito de cor que ficou estranho — pode retirar.
- [x] Feito: as duas coisas eram efeito colateral da correção anterior. (1) **O vão**: o
  `alvoDeLinkRente` tinha `minHeight: 44` e o texto do link tem ~20 — sobrava folga vertical dentro
  do alvo, e o `alignItems: center` do `photoRow` a empurrava para baixo da dica. Troquei a altura
  fixa por `paddingVertical: xs` + `hitSlop={12}`: a área de dedo continua ali (o `hitSlop` estende
  o toque para fora da caixa), mas sem ocupar espaço no layout. (2) **O efeito**: era o `superficie:
  true`, que pinta fundo ao toque — pensado para linha de lista, e num link curto no meio do texto
  ele desenha um retângulo do tamanho da frase, que lê como falha de renderização. Removido dos
  quatro links de anexo ("Adicionar/Trocar foto da caixa", "Adicionar arquivo", "Alterar anexo",
  "Remover"); a opacidade, que é o padrão do `estadoDePressao`, continua respondendo ao toque.

reduzir a frase "Aceita PDF, JPG ou PNG. Fica só no aparelho, não sobe pra nuvem." — pode tirar a
parte da nuvem.
- [x] Feito: virou só "Aceita PDF, JPG ou PNG." A lista de formatos vem do
  `ACCEPTED_DOCUMENT_LABEL`, compartilhado com a mensagem de erro do seletor de arquivos, então os
  dois lugares continuam dizendo o mesmo. A promessa de que o anexo não sai do aparelho continua
  nos Termos (é o que o bloco 5.1 do roteiro confere) — o comportamento não mudou, só deixou de ser
  repetida em cada cadastro.

no popup de lembrete: não gostei do vermelho e amarelo com opacidade baixa das mensagens de alerta.
Os botões ("Tocar no silencioso") e o texto abaixo precisam de mais destaque — título vs. subtítulo,
o subtítulo talvez 1px menor. E "Como funcionam os alertas" pode ser um button mesmo.
- [x] Feito: (1) **O painel encorpado.** `warningSurface` (`#FEF6E7`) e `errorSurface` (`#FDECEA`)
  são quase brancos, e dentro de um popup — que já é superfície branca — o bloco sumia. Trocar o
  token estragaria a `Dica`, que usa os mesmos sobre fundo cinza. **Primeira tentativa foi borda de
  1px + texto tingido, e o Gabriel pediu para tirar a borda: a cor do card em si não tinha mudado —
  estava certo, eu só havia contornado o bloco.** Agora o fundo é calculado, misturando 12% da cor
  do texto do estado na superfície dele (`misturarCores`, nova em `with-opacity.ts`): o aviso vai de
  `#FEF6E7` para `rgb(238,223,204)`, continua âmbar mas com corpo. Opaca e não `rgba`, senão o tom
  mudaria conforme a superfície atrás. Cada tema resolve o próprio par — no escuro a "tinta" é clara
  e o fundo clareia. O título e a explicação seguem tingidos (eram `onSurface`, o cinza de qualquer
  texto — o conteúdo não pertencia ao bloco que o cercava). (2) **Hierarquia nas linhas**: título e
  descrição eram ambos `400Regular` separados por 2px — o que não se lê como hierarquia. Título foi
  para semibold e a descrição para 13px (entre o `bodyMd` 14 e o `bodySm` 12; ela é a consequência e
  precisa ser lida). A escada ficou 16 semibold → 13 cinza → 12 azul (o "como fazer"). (3) **"Como
  funcionam os alertas" virou `Button` `outline`** — ele abre uma tela inteira, como os outros
  botões da folha; de link de texto parecia nota de rodapé do "Pronto". `outline` para não competir
  com o primário.

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

### Scanner [x]
`src/telas/Scanner/` — leitura do código de barras da caixa.

Revisada em aparelho e aprovada sem alterações.

### Cadastro de Compromisso
`src/telas/CadastroDeCompromisso/` — consulta, exame, renovação de receita.

-

---

## Fluxo de dose e alarme

### Horário [x]
`src/telas/Horario/` — tela aberta ao tocar numa notificação simples.

o "Tomei" do lado direito, seguindo a mesma estética da tela de alarme (cores e ícones). O botão de
ir pra home pode ser azul.
- [x] Feito: **Pulei à esquerda, Tomei à direita**, com ícone (✗/✓) ao lado do texto em pílula — a
  mesma ordem e forma do alarme, para quem responde nos dois lugares não reaprender onde fica o quê.
  A cor difere porque o fundo difere: no alarme o cartão é azul e "Tomei" é o branco; aqui o fundo é
  claro, então ele é o azul cheio. O que se mantém é a hierarquia (um cheio, um neutro) e o par de
  ícones, que é o que se reconhece antes de ler. O botão respondido **preenche**, invertendo texto e
  ícone — é a única pista visual de qual resposta está registrada, e o `accessibilityState.selected`
  cobre quem usa leitor de tela. "Ir para a Home" virou azul cheio.

Antes disso, dois alinhamentos com o resto do app: **padding do cartão** de 24 → 16 (como nas listas
de Remédios, Compromissos e Estoque) e a **foto da caixa** ao lado do nome (miniatura de 52px com
`contain`, sem corte). A foto faltava justamente aqui, que é o destino do "Ver e confirmar no app"
quando há 4+ remédios — o caso em que reconhecer a caixa mais ajuda. Sem foto, nada ocupa o lugar.

Chegou a sair sozinha depois da última resposta, e **a ideia foi revertida na mesma sessão**: a dose
respondida mostra a dica de correção ("Registrou errado? Toque em 'Pulei' para corrigir"), e sair
antes de ela ser lida torna a dica inútil. Quem responde por engano precisa do tempo de perceber —
é a mesma razão pela qual as duas respostas continuam disponíveis depois de registradas, em vez de
virarem um selo fixo. O botão de saída voltou a ficar sempre visível, agora como "Ir para a página
inicial".

💬 **Decisão registrada (05/09):** cogitamos remover a tela e mandar direto para a Home, já que com
**um** remédio ela não acrescenta nada (a dose está na Home em "É AGORA", com os mesmos botões).
Ficou mantida para todos os casos, por comportamento uniforme — uma notificação, um destino. O caso
que a justifica é 2+ remédios no mesmo horário: "Tomei todas" resolve o comum, mas quem tomou um e
não o outro não tem como dizer isso num botão, e na Home aquelas doses ficam espalhadas na agenda do
dia inteiro.

-

### Alarme
`src/telas/Alarme/` — tela cheia do alarme de dose (toca som, pede resposta).

revisão estética: o horário maior, a foto sem cortar e menor, botões "pulei"/"tomei" menores com o
ícone ao lado do texto, sem verde/vermelho (mesma estética do app, o que também previne o problema
no modo daltonismo), e o "responder depois" estava ilegível (cinza escuro sobre azul).
- [x] Feito: hora de 56 → 72 (é o primeiro dado que se procura ao ser acordado), ícone do topo de
  80 → 56 e o título virou etiqueta. **A foto**: era `width: 100%` com altura fixa e `cover`, que
  **cortava** a imagem — virou 132×132 com `contain`, então aparece como foi cadastrada (o cadastro
  já obriga a enquadrar; recortar de novo aqui descartaria o que a pessoa escolheu manter). **O
  cartão branco em volta do remédio saiu**: o fundo azul já é o cartão, e a moldura competia com o
  conteúdo. **Botões**: de 88 empilhado para 56 com ícone e texto na mesma linha; "Tomei" é o botão
  branco cheio e "Pulei" o translúcido — o que separa é o **peso**, não a matiz, exatamente pelo
  motivo do daltonismo que você levantou. O "Silenciar" virou contorno para não parecer uma terceira
  resposta (ele não registra desfecho). **"Responder depois"**: usava `Button variant="text"`, que
  pinta o rótulo com o cinza padrão do app — ilegível sobre o azul; agora é branco translúcido.
  Achei junto um defeito não pedido: **a tela não tinha rolagem** e, com dois remédios, o "Responder
  depois" saía da tela sem como alcançá-lo (é o bloco 4.1 do roteiro). Agora rola, com as ações
  fixas no rodapé.

o "adiar 5 minutos" não estava implementado na tela do alarme.
- [x] Feito: a função `adiarAviso` existia, testada e com a trava de um adiamento por horário — mas
  só era chamada pela **ação da notificação**. A tela cheia tinha apenas "Responder depois", que
  fecha sem prometer volta. Ligada à tela reaproveitando a mesma função (sem duplicar a regra); o
  botão some quando o horário já gastou o adiamento.

o alarme adiado voltou a tocar sem o nome do remédio, sem a dosagem e sem a foto — e o "tomei" não
atualizava a Home.
- [x] Feito: **os dois sintomas eram o mesmo defeito.** A chave do lembrete adiado é
  `adiado-<instante-do-toque>`, e esse instante ia no `data.scheduledFor`. A tela de alarme localiza
  as doses por `findBetween(instante, instante + 60s)` — ou seja, procurava doses agendadas para o
  minuto em que "Adiar" foi tocado (12:13), e as doses eram das 12:08. A lista voltava **vazia**:
  daí não haver nome/dose/foto, e o "Tomei" não registrar nada. Agrava que a tela não *parece*
  vazia, porque cabeçalho e botões existem de qualquer forma — ela operava sobre nada. Separei
  "quando tocar" de "de quando são as doses": o `AvisoDeDose` ganhou `instanteDasDoses`, preenchido
  só no adiado (nos avisos da grade os dois coincidem e o campo nem aparece).

com mais de uma medicação no mesmo horário, mostrar nome, dose e foto de cada — mas com limite, para
não poluir nem quebrar. Acima de 3, listar os nomes sem foto e obrigar a entrar no app.
- [x] Feito como decidido: **1–3** mostra foto, nome e dose de cada, com "Tomei todas"/"Pulei
  todas"; **4+** esconde as fotos, compacta o nome e troca as respostas por **"Ver e confirmar no
  app"**, que abre a tela do horário por deep link (a tela de alarme roda fora do expo-router, numa
  Activity própria — não há navegador a que pedir um `push`). O título passa a contar: "Hora dos
  seus 5 remédios". Adiar, Silenciar e "Responder depois" continuam nos dois casos. ⚠️ Registrei no
  código o argumento contrário, como decisão consciente: o custo recai sobre o polimedicado, que é
  quem mais se beneficiaria do botão direto — o "Ver e confirmar no app" como **primeira** ação é o
  que torna isso aceitável.

🔬 **VALIDADO EM APARELHO (05/09):** a dose confirmada num caminho **não pode ser confirmada de
novo** em nenhum outro. Testado nos quatro: alarme → notificação → tela do horário → Home. Confirmou
pelo alarme e os demais foram mitigados na hora; o estoque de 10 descontou **1**, uma vez só. A
guarda vive na regra (`resolvesDose` em `responder-aviso.ts`), e não na interface — é o que faz os
quatro caminhos convergirem em vez de cada tela precisar lembrar de checar.

a tela azul não aparece quando estou usando OUTRO aplicativo — só a notificação no topo. Quero a
tela azul independente de o celular estar bloqueado ou em uso.
- [x] Feito, **mas depende de build nova**. O rebaixamento é política do Android e está declarado na
  documentação do Notifee: com o aparelho em uso, o `fullScreenIntent` vira heads-up e não há API
  que force o contrário. O app já contornava isso **quando o Mapill era o app aberto** (o listener
  de `DELIVERED` navega para a tela); em outro aplicativo não havia o que navegar. A saída é
  `SYSTEM_ALERT_WINDOW` — a permissão que autoriza abrir uma tela a partir do segundo plano, o mesmo
  mecanismo da tela de chamada do WhatsApp. Adicionada ao `app.json`, com uma quarta linha no painel
  de permissões que abre a tela certa via `expo-intent-launcher` (instalado agora). ⚠️ **O estado é
  lembrado, não lido**: confirmei na doc do Expo 57 que nenhum módulo disponível expõe
  `canDrawOverlays`, então o item some quando é **tocado**, assumindo que quem foi à tela concedeu.
  Não é leitura de verdade; erra para o lado recuperável (quem não conceder fica com o
  comportamento atual). No caminho, corrigi um conflito que eu mesmo introduzira: a regra de
  "encerrar ao perder o primeiro plano" estava fechando também a tela aberta **como rota**, onde um
  `inactive` passageiro é normal — agora ela vale só para a Activity do full-screen intent.

⏳ **PENDENTE DE BUILD NOVA** (05/09): `SYSTEM_ALERT_WINDOW` no `app.json`. Permissão de manifesto
não entra por recarga do Metro — **até a build sair, a tela azul continua sem aparecer quando outro
aplicativo está em primeiro plano**, por mais que o código já esteja pronto. Não há contorno: a
documentação do Android lista a permissão como uma das exceções que autorizam iniciar uma tela em
segundo plano, e o app tem como alvo a API 35, onde a regra é ainda mais dura.

⚠️ **Erro cometido no caminho, para não repetir:** cheguei a instalar `expo-intent-launcher` e
deixar o `import` num arquivo que a Home carrega. Sendo módulo nativo, ele **derrubou o app inteiro**
no binário atual (`Cannot find native module 'ExpoIntentLauncher'` → Home → layout). Revertido para
`Linking.sendIntent`, que já vem no React Native e faz o mesmo. Regra que fica: dependência nativa
nova não pode entrar no caminho de execução antes da build que a contém.

**[x] Feito: o local onde a caixa está guardada aparece no alarme.** É a única hora em que essa
informação vale de verdade: quem acorda às 6h precisa saber para onde ir, e o campo mora na tela de
estoque, que ninguém abre no meio da noite. O `use-doses-do-alarme` passou a ler o `InventoryItem`
junto (só pelo `storageLocation` — a quantidade não entra numa tela que pergunta "você tomou?").

Pequeno e por último no bloco do remédio: às 3h o que precisa ser lido de longe é o horário e o
nome, e este é o detalhe que se procura depois de já ter levantado. Vai com ícone de localização
porque a orientação de tomada logo acima também é texto miúdo e claro — sem o marcador, "armário da
cozinha" leria como continuação de "tomar em jejum". A opacidade fica no bloco e não em cada filho,
para o ícone não ficar mais forte que a palavra que ele marca.

Só no alarme, não na tela de Horário: aquela é consultada com o telefone na mão, e não é o caso de
alguém recém-acordado procurando a caixa.

### ⏳ Conferir na próxima build

Correções feitas em 05/09 que **não puderam ser validadas** no binário atual. Testar todas assim que
a build sair:

1. **Tela azul sobre outro app.** Depende de `SYSTEM_ALERT_WINDOW` no manifesto (a única coisa que
   exige a build). Hoje, com o Instagram aberto, só o heads-up aparece. Paliativo já no código: tocar
   no heads-up de um alarme abre a **tela do alarme** (foto, adiar, silenciar) e não a de
   confirmação — antes caía no caminho da notificação comum.
2. **Alarme adiado tocando na hora.** O app usava `allowWhileIdle`, que a própria API do Notifee
   marca como *deprecated*: ele permite disparar em Doze mas deixa o Android **agrupar e adiar**. Em
   aparelho, o adiado só tocou quando a tela foi ligada. Agora usa `AlarmType.SET_ALARM_CLOCK`, a
   mesma categoria do despertador nativo. *(Não depende de build — `USE_EXACT_ALARM` já está no
   binário —, mas só se confirma com o celular bloqueado.)*
3. **Notificação com som.** O canal omitia `sound`, e o comentário no código afirmava que isso
   significava "som padrão". A documentação do Notifee diz o oposto: omitir cria o canal **mudo**.
   Agora é `sound: "default"`, e o `recriarSeDivergente` — que só cuidava do canal de alarme — passou
   a apagar e recriar o de lembrete, porque canal criado é imutável no Android.
4. **Notificação chegando com a tela desligada.** Mesma causa do item 2; ela também subiu para
   `SET_ALARM_CLOCK`. A diferença entre os dois modos continua no **canal** (volume, Não Perturbe,
   tela cheia), que é onde ela sempre esteve.
5. **Botões da notificação: Tomei e Pulei.** "Adiar" saiu — ele faz sentido no alarme, que
   interrompe, não num aviso discreto. "Pulei" preenche uma lacuna real: havia saída para quem tomou
   e para quem adia, nenhuma para **quem não tomou**, e o relatório distingue "pulada" de "sem
   registro". Rótulos curtos também ajudam a caber sem a seta de colapso do Android.

-

### Adesão [x]
`src/telas/Adesao/` — relatório de adesão ao tratamento.

**[x] Feito: doses não tomadas viraram acordeão.** A lista aberta empurrava a tabela por
medicamento e o botão do PDF para baixo, e quanto pior a adesão, mais longe eles ficavam — a tela
devolvia um rolo de falhas justamente a quem mais precisa dela. O título carrega a contagem
("12 doses não tomadas"), então o número, que é a informação, se lê sem abrir; o detalhe de cada
dose fica para quem foi procurá-lo.

**[x] Feito: seção de exportação separada por linha horizontal, com ícone de PDF.** O relatório
não é mais um botão solto no fim da rolagem: virou um bloco com título próprio ("Seu relatório de
adesão", no lugar de "levar para a consulta", que presumia o destino), subtítulo menor, e o divisor
marcando que ali começa outra tarefa — ler a adesão e gerar o documento são coisas diferentes.

**[x] Feito: seletor de período repetido dentro da seção de exportação.** O período do topo governa
a leitura da tela; quem chega ao rodapé para gerar o PDF já rolou para longe dele e não sabe qual
recorte vai sair no arquivo. Repetir o seletor ali responde a pergunta no lugar onde ela nasce.

**[x] Feito: seleção de medicamentos e de compromissos no PDF.** Quem toma seis medicações e vai ao
médico de uma delas não leva as outras cinco. São duas listas independentes, com setinha de abrir,
porque o sistema não vincula medicamento a compromisso — quem sabe da relação é o paciente, e a
escolha é dele. Agrupadas com `gap: spacing.sm` para lerem como um par, e não como dois campos
distantes.

**[x] Feito: botão de download em azul principal.** É a ação da seção, e estava com o mesmo peso
visual dos seletores acima dele.

**[x] Feito: "Dia a dia" — a adesão por dia, sempre dos últimos sete.** A taxa do topo descreve o
conjunto e esconde a forma dele: seis dias perfeitos com um zerado dão quase o mesmo número que
sete dias irregulares, e as duas situações pedem conversas clínicas diferentes. O mini-gráfico da
Home mostra isso em barras, mas barra não se lê como número — dá para ver que um dia foi pior, não
*quanto* pior.

São sete dias fixos, e não o período selecionado acima. Noventa linhas para procurar 12 de julho
não é leitura, é arquivo; e para essa pergunta existe o **calendário**, que mostra o dia dose por
dose em vez de porcentagem. Vale registrar por causa de uma dúvida que apareceu no teste: os sete
dias são **janela de leitura, não retenção** — os registros de dose ficam no banco
indefinidamente, e é o que permite os relatórios de 30 e 90 dias existirem.

**[x] Feito: o dia a dia virou uma faixa de sete colunas, não uma lista.** Sete linhas empilhadas
davam peso de registro a uma informação que é um número por dia — e ainda empurravam o resto da
tela para baixo. A faixa é um cartão só com sete colunas dentro (sigla em cima, número no meio,
data embaixo), porque a semana é uma coisa só e a leitura que interessa é a **comparação entre os
dias**, que a lista vertical não dá. É de propósito a mesma forma das sete barras do card da Home:
quem viu lá reconhece aqui.

O `%` fica **em cada célula**, e não só no título: "86" sozinho obriga a pessoa a procurar a unidade
em outro canto da tela para saber o que está lendo. Ele vai aninhado no mesmo `Text`, menor e mais
leve — assim acompanha a linha de base do número e encolhe junto, em vez de quebrar para baixo na
coluna estreita. O valor usa `bodyLg` e não `headlineSm` porque, com fonte grande do sistema, "100%"
em headline estoura a coluna, e número cortado é pior que número menor. Hoje se distingue por
**peso**, não por cor — a cor da coluna já está reservada para a faixa da taxa.

O título passou a dizer a **janela**, não a unidade: "Seus últimos sete dias". Com o `%` de volta às
células, o que sobrava de dúvida era "sete dias de quando" — ainda mais porque esta faixa não
acompanha o período escolhido acima.

Sobre as cores: verde ≥ 80%, amarelo 50–79%, vermelho < 50%, iguais às da lista por medicamento. Os
cortes vêm da literatura de adesão que o artigo cita (80% é o limiar clássico de tratamento
aderente; abaixo de 50%, adesão pobre), e não de escolha estética.

**[x] Feito: o bloco de doses não tomadas ganhou contraste.** O `Accordion` usa
`surfaceContainerLow`, que quase empata com o fundo da tela — certo nos textos longos (termos,
consentimento), onde ele é parágrafo e não cartão. No meio de uma tela de cartões ele sumia, e nada
indicava que havia algo a abrir. Passou a usar a `surfaceContainerLowest` dos cartões vizinhos, via
uma prop `style` nova no componente (o padrão dele não mudou, então as outras telas seguem iguais).
No tema de alto contraste ele também recebe borda, senão seria o único bloco sem contorno
justamente no tema em que a sombra não se enxerga.

**[x] Feito: a barra do gráfico da Home entrou em cada coluna, agora com o número junto.** No card
da Home a barra aparece sozinha e não diz o que significa — dá para ver que um dia foi pior, não
*quanto* pior. Aqui as duas leituras andam juntas: a **forma** se compara de relance entre as sete
colunas, o **número** é o que se cita ao médico.

**[x] Feito: o gráfico ficou idêntico ao da Home.** Primeira versão tinha desenho próprio (56px,
trilho cinza atrás, barras verde/amarelo/vermelho). Dois gráficos diferentes para o **mesmo dado**
fazem o leitor procurar uma diferença que não existe — as sete barras daqui e as de lá saem do mesmo
cálculo. Agora compartilham altura (80px), cor (`primary` a 0.2, com o dia de hoje em opacidade
cheia), raio, `gap` e o traço fino de 2px para dia sem dose. O trilho saiu junto: a Home nunca teve,
e sem ele a leitura ficou mais limpa no aparelho.

O número também virou azul. A faixa clínica (verde/amarelo/vermelho) segue **só na lista por
medicamento**, e é o lugar onde ela aponta para uma ação: qual remédio está falhando. Na semana ela
pintava um veredito diário que ninguém trata dia a dia. Barra de 0% mantém 3px de mínimo — um dia
zerado é informação, e a coluna vazia se confundiria com o traço de "não havia dose".

Dia sem dose agendada mostra um traço, e não "0%": não houve falha, houve ausência de dado. A conta
só considera doses cujo horário já passou, a mesma regra da taxa geral (RN20) — a dose das 22h não
pode contar contra alguém às 15h. Regra em `src/domain/use-cases/adesao-por-dia.ts`, com 7
verificações em `scripts/conferir-adesao-por-dia.mjs` (incluindo o agrupamento por dia **local**:
com `toISOString`, uma dose das 22h cairia no dia seguinte).

**[x] Feito: "Ver minha adesão" no card de acompanhamento semanal da Home.** A seta no canto dizia
que algo abria, mas não o quê — e o que abre é a tela onde a adesão se lê por dia e o PDF da
consulta se gera, nada disso adivinhável de um mini-gráfico. O card inteiro continua tocável para
quem já sabe; a chamada é para quem não sabe. Ela vai com `pointerEvents="none"`, então o toque
atravessa para o card: um destino, um alvo, um nó só no leitor de tela.

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

### Conta [x]
`src/telas/Conta/` — dados da conta, sincronização, exclusão.

O conteúdo já estava resolvido (seções nomeadas, textos que mudam conforme haja conta vinculada,
exportar posicionado antes de apagar). Os ajustes foram de estética.

**[x] Feito: o subtítulo das linhas ficou menor.** Estava em `bodyMd` (14px), quase do tamanho do
`bodyLg` do rótulo, e as duas linhas liam como um parágrafo de duas frases em vez de título e
explicação. Em `bodySm` (12px) a hierarquia aparece: o rótulo se lê ao varrer a lista, a dica só
quando o olho para naquela linha.

**[x] Feito: faixa de abertura, com cor.** A tela começava direto num rótulo em maiúsculas, e o
assunto — conta, privacidade, apagar dados — chegava sem nada que o enquadrasse. Agora abre com uma
frase dizendo o que se resolve ali, sobre um fundo azul claro com o ícone de escudo. É o mesmo papel
da faixa do hero em Ajustes: tirar o topo do aspecto de lista uniforme, e dar à tela o tom do que
ela trata.

**[x] Feito: a exportação virou um pacote de planilhas.** O JSON cumpria a portabilidade da LGPD
(art. 18, V — "formato de uso comum e leitura por máquina"), mas cumpria só a metade que interessa a
um programador: quem baixa a própria cópia quer **abrir e olhar**, e um JSON de nove tabelas
aninhadas não se lê no celular nem se importa em lugar nenhum que o paciente use.

Agora sai um `.zip` com uma planilha CSV por tabela, mais um `LEIA-ME.txt` explicando o que é cada
uma e por que há linhas que a pessoa não vê mais no app (as com `deleted_at`). Um zip e não nove
arquivos porque a tela de compartilhar do Android envia um por vez. Uma planilha por tabela e não
uma só com tudo porque as nove têm colunas diferentes — juntá-las daria uma tabela com dezenas de
colunas quase todas vazias.

Dois detalhes que decidem se o arquivo é utilizável: **BOM** no início de cada CSV (sem ele o Excel
no Windows lê como ANSI e "Medicação" vira "MedicaÃ§Ã£o") e escape RFC 4180 nas células (sem ele uma
observação com vírgula desloca todas as colunas seguintes). Compactação por `fflate` — JS puro, sem
módulo nativo, então funciona no binário atual.

### Ajustes (continuação)

**[x] Feito: as linhas de menu ficaram mais baixas.** O `Card` padrão tem `gap: gutter` (24) entre
filhos — medida pensada para blocos de formulário, onde os campos precisam de ar. Numa lista de menu
isso somava com o `minHeight: 52` de cada linha e dava **76px por item**: cada botão ocupava uma
faixa de tela sem carregar mais informação por isso. Com `sm` (8) a linha mantém os 52 de alvo de
toque e a lista volta a ler como lista.

**[x] Feito: menos vão entre as seções.** `gutter` (24) no lugar de `lg` (32). A Home usa 40 porque
lá cada bloco é um assunto independente que disputa atenção; aqui todas as seções são a mesma coisa
— opções de configuração —, e o vão grande fazia cada título nascer isolado no meio de um vazio,
sobretudo depois do indicador de sincronização.

**[x] Feito: o aviso de "alterações não sincronizadas" saiu.** O contador roda **mesmo sem conta
vinculada** — o comentário no código afirmava o contrário, e o teste em aparelho mostrou o aviso
aparecendo numa conta local. Ali ele anunciava um problema que não existe e que a pessoa não pode
resolver: usar o app só localmente é uma escolha legítima, não um estado pendente. Com conta
vinculada também não se justificava, porque a sincronização é automática a cada volta ao app. O que
resta de útil é o **estado** da cópia, e isso a tela de Conta já mostra no `IndicadorDeSync` — que,
ao contrário deste, só aparece com conta. O componente `AvisoDePendencias` ficou no kit, sem uso,
para o caso de a sincronização evoluir.

**[x] Feito: as opções de tema alinhadas ao mesmo padrão.** O nome de cada tema estava em
`headlineSm` — mais peso que o rótulo do menu que leva até ali. Virou `bodyLg`, com a descrição em
`bodySm`: o mesmo par título/subtítulo de Conta e Ajustes.

---

## Outras

### Em Construção
`src/telas/EmConstrucao/` — placeholder para funcionalidade ainda não implementada.

-
