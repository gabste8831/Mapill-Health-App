# Mapill — Embasamento técnico para o artigo

> Documento de transporte: levantado do código-fonte em 10/09/2026, para ser colado no chat onde o
> artigo é redigido. Cada afirmação aqui tem arquivo e linha atrás dela.
>
> **Sobre o que está marcado 🔖:** são pontos que precisam de referência bibliográfica real, que
> este documento não fornece. Onde há norma escrita e verificável (WCAG, LGPD, ISO), a citação está
> completa. Onde a afirmação é epidemiológica ou clínica, está marcada para você buscar a fonte —
> não invente número, é o que uma banca derruba com uma pergunta só.

---

## 0. Correção urgente ao artigo: a biblioteca de notificações mudou

**O artigo diz `expo-notifications`. O app não usa `expo-notifications`.**

Verificação feita: `grep` por `from 'expo-notifications'` em `src/` e `app/` retorna **zero
ocorrências**. O pacote continua listado no `package.json:27` como dependência órfã, e será
removido. Todo o subsistema de avisos importa `react-native-notify-kit`.

| | Situação real |
|---|---|
| Biblioteca de avisos | `react-native-notify-kit` ^10.7.0 (`package.json:43`) |
| Arquivos que a importam | 6, todos em `src/notifications/` e `src/telas/Alarme/` |
| `expo-notifications` | Instalado, **nunca importado** — resíduo da migração |

### Por que a troca aconteceu, e por que isso interessa ao artigo

O Notifee foi **arquivado em 07/04/2026**. Dois defeitos decorrem disso e estão documentados no
roteiro de teste:

1. O *boot receiver* do Notifee **nunca era invocado no Android 12+**. Consequência prática: depois
   de reiniciar o aparelho, os alarmes agendados não voltavam. Para um app de adesão medicamentosa
   isso não é um bug de conveniência — é o app falhando exatamente na função que justifica sua
   existência.
2. Sem manutenção, a biblioteca não acompanharia as restrições progressivas do Android a alarmes
   exatos e *full-screen intents*.

A migração foi para o fork mantido (`react-native-notify-kit`).

**Ganho arquitetural colateral, que vale ser narrado no artigo.** No `expo-notifications`, os botões
de ação viviam em **categorias registradas no sistema antes do agendamento**. O app precisava manter
quatro categorias para cobrir as combinações de *"uma ou várias doses"* × *"pode adiar ou não"*, e
uma função traduzia contagem em nome de categoria. No Notifee/notify-kit os botões vão **na própria
notificação**, montados na hora. A indireção inteira deixou de existir — e com ela a classe de
defeito em que se agenda um aviso apontando para uma categoria que não corresponde ao que ele de
fato oferece (`src/notifications/acoes.ts:19-27`).

É um exemplo concreto de *acoplamento removido*, útil se o artigo discute SOLID ou Clean
Architecture.

### O que o artigo precisa dizer sobre entrega do aviso

O agendamento é delegado ao **AlarmManager do Android** via `TriggerType.TIMESTAMP`
(`src/notifications/notifee-gateway.ts:265,306`). Quem guarda o horário é o sistema operacional, não
o app. Consequência: o alarme dispara com o app encerrado e sem processo em memória — requisito
não-negociável num app de medicação.

---

## 1. Acessibilidade

### 1.1 Cobertura de API semântica

Levantamento por `grep` em `src/`:

| Recurso | Arquivos |
|---|---|
| `accessibilityRole` | 50 |
| `accessibilityLabel` | 46 |
| `accessibilityState` | 11 |
| `hitSlop` | 34 ocorrências |
| `minHeight/minWidth: 44 ou 48` | 19 ocorrências |
| `accessibilityHint` | **0** |

**Sobre os 44pt:** a WCAG 2.2 traz o critério **2.5.8 Target Size (Minimum)**, nível AA, que exige
alvos de no mínimo **24×24 px CSS**. Os **44×44pt** que o app adota vêm das *Human Interface
Guidelines* da Apple, e os **48dp** das *Material Design Guidelines* do Android — ambos mais
exigentes que a WCAG. Vale dizer isso no artigo: o app não segue o mínimo normativo, segue a
recomendação de plataforma, que é mais rigorosa.

**Sobre `accessibilityHint` estar em zero:** é uma lacuna real e vale declará-la como trabalho
futuro em vez de omitir. O `hint` descreve *o que acontece ao ativar*, complementando o `label`, que
diz *o que o elemento é*. Uma banca atenta pergunta por ele.

### 1.2 Leitor de tela (TalkBack)

Anúncios programáticos via `AccessibilityInfo.announceForAccessibility`, usados onde a mudança de
estado é visual e não teria como ser percebida por quem não vê a tela:

- `src/ui/BarraDeProgresso/BarraDeProgresso.tsx:90` — progresso de adesão
- `src/ui/SuccessOverlay/SuccessOverlay.tsx:54` — confirmação de ação concluída

Isso atende **WCAG 4.1.3 Status Messages** (AA): mensagens de status precisam ser expostas à
tecnologia assistiva sem exigir foco.

O bloco 9 do roteiro de teste (TalkBack) **foi percorrido em aparelho e aprovado em 08/09**.

### 1.3 Redução de movimento

`src/hooks/use-reduzir-movimento.ts` lê `AccessibilityInfo.isReduceMotionEnabled()` e assina
`reduceMotionChanged`, respeitando a preferência do sistema em tempo real. Atende **WCAG 2.3.3
Animation from Interactions** (AAA).

### 1.4 Os três temas de acessibilidade

Ficam em `src/shared/theme/temas/`. São escolha explícita de quem usa, não detecção automática.

#### Alto contraste (`alto-contraste.ts`)

Público declarado no próprio código: catarata, degeneração macular, glaucoma — e o caso banal de
uso sob sol forte.

🔖 **O código afirma: "a incidência de catarata passa de 50% acima dos 65 anos".** Busque a fonte
real — o *Global Burden of Disease* ou dados do Ministério da Saúde/Conselho Brasileiro de
Oftalmologia servem. É um dado que amarra a decisão de design ao público-alvo e vale a citação bem
feita.

O que o tema muda, e o raciocínio:

- **Preto absoluto sobre branco absoluto: 21:1.** O tema padrão usa `#141719` sobre `#F1F4F8`
  (**14.8:1**) porque cinza-escuro sobre off-white cansa menos a vista saudável. Para vista
  comprometida, conforto é secundário: o que importa é o degrau máximo.
- **O azul escurece em vez de clarear.** `#0B5FD9` dá 6.4:1 — aprovado em AA, reprovado em AAA. No
  alto contraste vira `#0044A3`. Continua sendo azul e continua sendo a cor da ação.
- **Contorno em vez de sombra** (`contornarSuperficies: true`). A regra geral do app é "sombra e
  nunca borda", mas ela pressupõe enxergar 8% de opacidade. Quem escolheu este tema não enxerga — a
  sombra deixa de ser discrição e vira informação perdida.
- **Superfícies de estado perdem o pastel.** `errorSurface` (`#FDECEA`) é quase branco; com catarata
  não se distingue de branco.

#### Sem depender de cor / daltonismo (`daltonismo.ts`)

🔖 **O código afirma: "deuteranopia e protanopia atingem cerca de 1 homem em 12".** Busque a fonte
— a literatura oftalmológica costuma dar ~8% dos homens de ascendência europeia. Confirme e cite.

O problema, nas palavras do código: vermelho é "dose atrasada", verde é "é agora, tome". São as duas
cores mais carregadas de significado no app, e são exatamente as que essas condições confundem. Para
essas pessoas, *os dois cartões mais importantes da agenda são o mesmo cartão bege*.

**A solução recusada, e por quê.** Trocar verde por azul não serve: azul já é a cor da ação no app, e
reusá-lo para "está certo" apagaria a distinção entre "toque aqui" e "isto está resolvido".

**A solução adotada é redundância** — a cor continua lá, mas nunca sozinha. É o princípio da **WCAG
1.4.1 Use of Color** (nível A): *cor não pode ser o único meio de transmitir informação*. No app isso
é a flag `reforcarFormaEIcone`, usada em 5 arquivos: quem enxerga cor lê o app como sempre; quem não
enxerga lê o ícone e o rótulo.

Os ajustes de tinta que restam: verde puxa para **teal**, vermelho puxa para **magenta** — o par se
separa em luminosidade e matiz de um jeito que sobrevive à deuteranopia, enquanto verde-grama e
vermelho-tijolo colapsam em tons quase idênticos.

#### Escuro (`escuro.ts`)

Tema convencional, sem finalidade assistiva declarada.

### 1.5 Escala de fonte

O app **não** usa `allowFontScaling={false}` nem `maxFontSizeMultiplier` em lugar nenhum
(verificado por `grep`). Ou seja: **respeita integralmente a escala de fonte do sistema**, inclusive
no máximo.

Isso é uma decisão de acessibilidade forte e vale ser dita explicitamente — muitos apps travam a
escala para não quebrar o layout, o que inutiliza o recurso para quem depende dele. O custo é que o
layout precisa aguentar o tamanho máximo, e é por isso que o bloco 10 do roteiro de teste percorre
todas as telas com a fonte do sistema no máximo.

Atende **WCAG 1.4.4 Resize Text** (AA).

---

## 2. Cores: a paleta e seu embasamento

Arquivo: `src/shared/theme/colors.ts`. As razões de contraste abaixo estão calculadas no próprio
código.

### 2.1 A regra que organiza tudo: cor só com função

O vocabulário do app é de quatro cores, e está escrito no código:

> **vermelho** para o urgente, **verde** para o que está na hora, **azul** para o destaque comum,
> **amarelo** para o alerta.

Há um registro valioso de *remoção* deliberada: o terciário laranja (`#C05400`) do Material Design
foi excluído em 06/09. O motivo, no código: *"ele existia porque a paleta nasceu do gerador de temas
do Material, e não porque o app precisasse dele"*. Um único estilo o consumia, e num bloco de texto
o laranja escuro lê como marrom — uma quinta cor num app que fala quatro. Manter o token convidaria
ao uso por engano.

Se o artigo discute design system, esse é um bom exemplo de *curadoria contra a ferramenta*: o
gerador oferece uma paleta completa, e o projeto recusa o que não tem função.

### 2.2 O azul, e por que ele não pinta fundo

`primary: #0B5FD9` — **6.4:1 sobre branco** (AA folgado para texto normal, AAA para texto grande).

O azul marca *o que é ação e o que é agora*. Por isso **não** pinta fundo de tela, cabeçalho nem
barra de abas: cor que está em toda parte deixa de significar alguma coisa, e o azul precisa
continuar querendo dizer "toque aqui".

`primaryContainer` merece nota no artigo como caso de correção guiada por medição: era `#2B7BF5`,
que com branco por cima dava **4.00:1** e **reprovava em AA** — e ele carrega texto (selo do
diagnóstico, iniciais do avatar). Foi para `#1F6FE8`, que dá **4.62:1**.

### 2.3 O amarelo: o caso mais instrutivo da paleta

Três tentativas fracassaram antes da solução, e o erro era sempre o mesmo: **tratar o amarelo como
cor de texto**. Amarelo puro `#FFE600` dá **1.6:1** sobre branco; `#FFC107` dá **1.63:1** — invisível
nos dois casos. Escurecer até passar produz marrom (`#7C3A06`); fugir do marrom com cinza-quente
produz `#4A4436`, que deixou o bloco sem vida.

**A solução veio do semáforo:** o amarelo é a **lâmpada acesa**, não a tinta. `warningSurface` virou
o amarelo de verdade (`#FFC107`) e o texto sobre ele é quase-preto — **10.68:1**, o maior contraste
de qualquer estado do app.

**Por que amarelo e não laranja:** com o erro em 0° e o alerta em 17°, os dois virariam graus da
mesma cor. O que distingue "acaba em cinco dias" de "acabou" é diferença de **espécie**, não de
intensidade. Em 35° o amarelo se separa do vermelho.

**Três tokens, não dois:** `warningVivo` (amarelo aceso) só serve em área pequena com texto escuro —
selo, faixa, ponto. `warningSurface` segue pastel porque cobre blocos inteiros: *amarelo cheio num
painel de quatro linhas não avisa, agride*.

### 2.4 O vermelho e a coerência de matiz

Os três vermelhos compartilham **matiz 0°** de propósito: o ícone (`errorVivo`), o cartão
(`errorPreenchido`) e a palavra compartilham a mesma cor em intensidades diferentes — é o que faz o
app parecer ter um vermelho só em vez de três parecidos.

O `#C4141C` anterior ficava em **357°**, do lado do roxo, e era isso que o fazia parecer vinho.
Atual: **6.03:1 sobre branco**, **5.27:1 sobre `errorSurface`**.

### 2.5 Referência normativa das razões

Todos os valores acima devem ser reportados contra a **WCAG 2.1/2.2, critério 1.4.3 Contrast
(Minimum)**, nível AA: **4.5:1** para texto normal, **3:1** para texto grande (≥18pt, ou ≥14pt em
negrito). O nível AAA (1.4.6) exige **7:1** e **4.5:1** respectivamente.

O tema de alto contraste é o que persegue o AAA; o tema padrão fica em AA deliberadamente, por
conforto de leitura.

---

## 3. LGPD

O app trata **dado pessoal sensível de saúde**, o que aciona o regime reforçado da Lei nº
13.709/2018.

### 3.1 Base legal: consentimento explícito

`src/domain/entities/consent.ts` e `src/telas/Consentimento/texto-legal.ts`.

A base legal declarada é **consentimento**, invocando **art. 7º, I** (base geral) e **art. 11, I**
(base específica e reforçada para dado sensível de saúde). O consentimento é **condição obrigatória
antes de qualquer tela que colete dado clínico** — ficha de saúde, medicamentos, doses,
compromissos. O fluxo é: login → consentimento → ficha.

### 3.2 Versionamento do consentimento — o ponto forte da implementação

```ts
export type ConsentRecord = SyncableEntity & {
  termsVersion: string;
  acceptedAt: string;  // ISO 8601 — timestamp exato do aceite, guardado como prova
};
```

`CURRENT_TERMS_VERSION = "1.2.0"` (`texto-legal.ts:29`).

A regra: **se o texto de Termos/Política mudar, a versão muda junto — e um registro de versão antiga
não conta como consentimento válido para a versão vigente.** A pessoa precisa consentir de novo.

Isso responde diretamente ao **art. 8º, §6º** da LGPD, que exige novo consentimento quando há
alteração de finalidade ou de tratamento. É o tipo de detalhe que distingue um app que *diz* seguir a
LGPD de um que a implementa.

Detalhe arquitetural: a tabela `consent_records` (migration 006) **não tem vínculo com
`patient_profiles`**, de propósito — o consentimento acontece antes da ficha existir, e precisa
existir mesmo que o paciente ainda não tenha nenhum outro dado salvo.

### 3.3 Direitos do titular (art. 18)

O texto legal, seção 6, enumera os direitos do art. 18. A implementação do direito mais difícil — a
**exclusão** — está em `src/data/remote/apagar-na-nuvem.ts`, e o raciocínio merece figurar no artigo:

> O soft delete é a ferramenta certa para a exclusão do dia a dia, em que a linha precisa sobreviver
> para contar ao outro aparelho que morreu. Aqui é outra coisa: é o direito de exclusão da LGPD, e
> ele exige que o dado **saia**. Uma linha marcada como apagada continua sendo dado pessoal guardado
> num servidor.

Ou seja: o app usa `deleted_at` (soft delete) para sincronização, e **`DELETE` real** para o direito
do titular. São mecanismos distintos para propósitos distintos — e confundi-los seria descumprir a
lei enquanto se aparenta cumpri-la.

Dois detalhes de implementação com boa justificativa:

- **Ordem inversa à da sincronização.** Na sync é pai antes de filho, para nada chegar órfão; no
  apagamento é filho antes de pai, para nada *ficar* órfão.
- **Não lança exceção.** Sem conta vinculada ou offline, não há nuvem a limpar — e nos dois casos o
  apagamento local precisa acontecer do mesmo jeito. Travar por causa da nuvem deixaria os dados nos
  **dois** lugares. O texto legal descreve o caminho de contato para exclusão remota em até 15 dias.

### 3.4 Minimização e localidade do dado

O app é **offline-first**: o dado nasce e vive no SQLite local (`expo-sqlite`), e a nuvem é
sincronização opcional. Sem conta vinculada, **nenhum dado de saúde sai do aparelho**.

Isso é minimização (**art. 6º, III**) e segurança (**art. 6º, VII**) na arquitetura, não na política.

### 3.5 Operador

O texto legal identifica o **Supabase como operador** nos termos da LGPD, com o titular do app como
controlador. Nomear a cadeia de tratamento é exigência do art. 5º, VI e VII.

---

## 4. Segurança e auditoria

### 4.1 Sobre PSI — leia antes de citar

Você levantou PSI (Política de Segurança da Informação). **Recomendo não reivindicar uma PSI
formal**, e explico por quê: PSI é um documento **organizacional**, que pressupõe uma organização com
ativos inventariados, papéis definidos e responsáveis nomeados. O Mapill é um TCC individual sem
pessoa jurídica. Uma PSI formal seria documentação de fachada, e é frágil na arguição.

O que sustenta o mesmo argumento com mais honestidade:

| Referencial | Como usar |
|---|---|
| **ISO/IEC 27001 / 27002** | Mapear os controles que o app *de fato* implementa contra o catálogo da norma. Você não certifica nada — mapeia. É legítimo e verificável. |
| **LGPD art. 46** | Segurança desde a concepção. É a norma que *obriga* aqui, e você tem evidência de sobra. |
| **LGPD art. 48** | Comunicação de incidente — relevante se o artigo discutir plano de resposta. |
| **OWASP MASVS** | *Mobile Application Security Verification Standard* — é o referencial certo para app móvel, e mais específico que a ISO para este caso. |

🔖 **Pergunte ao orientador** se a disciplina de Auditoria e Segurança de Sistemas espera uma PSI
formal mesmo em contexto de TCC individual. Se esperar, o caminho honesto é escrevê-la como
*proposta* para o cenário hipotético de o app virar produto, deixando claro que é projeção.

### 4.2 Controle de acesso: RLS

`docs/supabase-schema.sql`. **Row Level Security** ativo nas nove tabelas, com quatro políticas cada
(SELECT, INSERT, UPDATE, DELETE), todas na forma `user_id = auth.uid()`.

`auth.uid()` é extraído do JWT do usuário autenticado. Sem token, `auth.uid()` é NULL e **nenhuma
linha é alcançada**. A consequência que vale escrever: mesmo um `DELETE` sem cláusula `WHERE` não
tocaria em dado alheio, porque a política é aplicada pelo banco.

O código ainda assim aplica o filtro explícito por `user_id`, e a justificativa está no comentário:
*"segurança que depende de uma camada só é segurança que ninguém revisou"*. É defesa em
profundidade, e é um bom achado para a seção de segurança.

### 4.3 Trilha de auditoria clínica: append-only

Este é, na minha leitura, **o argumento mais forte do app para a seção de auditoria**.

```ts
/** Append-only: correção de um log errado é um novo registro, nunca um update. */
export type IntakeLog = SyncableEntity & {
  doseScheduleId: string;
  status: IntakeStatus;
  occurredAt: string;
  correctsLogId: string | null;
};
```

Nenhum registro de dose é sobrescrito ou apagado. Uma correção retroativa — o paciente lembra no dia
seguinte que tomou — cria um **novo** registro apontando para o que ele substitui, via
`correctsLogId`. O histórico completo é reconstruível.

Isso é imutabilidade de registro clínico, o mesmo princípio que rege prontuário eletrônico. Conversa
diretamente com **integridade** (o I das propriedades ACID e um dos pilares da tríade CIA) e com
auditabilidade.

🔖 Se quiser amarrar a norma de prontuário: a **Resolução CFM nº 1.821/2007** trata de digitalização
e guarda de prontuário, e o **SBIS/CFM** mantém o Manual de Certificação para SRES. Verifique a
aplicabilidade — o Mapill não é prontuário, é diário do paciente, e a distinção importa.

### 4.4 Os três estados da dose, e o que eles preservam

```ts
export type IntakeStatus = "confirmed" | "skipped" | "deferred";
```

O estado `deferred` ("ignorar por agora") existe para separar **"vi e decidi depois"** de **"nunca
vi"** — que é `null`. A dose continua pendente e volta a aparecer.

A função `resolvesDose()` formaliza quais estados encerram a dose. Essa distinção é o que permite ao
relatório de adesão diferenciar **"pulada"** de **"sem registro"**, que são fatos clínicos
diferentes.

O botão "Pulei" na notificação foi acrescentado justamente por isso: antes havia saída para quem
tomou e para quem quer ser lembrado, mas **nenhuma para quem não tomou** — e a dose não tomada caía
em "sem registro" por falta de caminho, não por escolha (`src/notifications/acoes.ts:31-38`).

---

## 5. Integridade do dado clínico nas decisões do alarme

Esta seção reúne decisões de projeto cuja justificativa é **não inventar dado clínico**. É material
forte para o artigo porque cada uma é uma restrição autoimposta que custa conveniência.

### 5.1 "Adiar" não registra desfecho nenhum

`src/notifications/responder-aviso.ts:96-111` e `acoes.ts:10-17`.

Adiar reagenda o aviso e **não grava log algum** — nem mesmo `deferred`. O raciocínio:

> Quando o horário tem mais de uma dose, quem tomou uma e não a outra não está afirmando nada sobre
> nenhuma delas ao adiar — está dizendo "me lembra de novo". Registrar um desfecho ali inventaria
> uma resposta que ninguém deu.

O aviso que volta em 5 minutos traz só o que ainda estiver pendente. Resposta parcial ("tomei este,
aquele não") se resolve tocando no corpo da notificação, que abre a tela do horário com Tomei/Pulei
**por dose** — o único lugar onde ela cabe sem ambiguidade.

### 5.2 Um adiamento por horário

`snoozeCount` é a trava: **um só adiamento por horário**. A origem é um defeito real, registrado em
29/08 — cinco toques em "Adiar" produziam **cinco lembretes**, porque cada toque disparava o handler
de novo. O aviso que volta depois de um adiamento **não oferece adiar outra vez**.

Num app de medicação, adiamento infinito é a falha silenciosa mais provável: a pessoa empurra o
alarme indefinidamente e o app registra adesão que não houve.

### 5.3 "Tomei" confirma sem abrir o app — e por que é exceção consciente

O projeto exige confirmação visual para ações críticas. "Tomei" na notificação **pula essa
confirmação**, e o código declara a exceção em vez de escondê-la:

> Tocar num botão rotulado "Tomei" já é uma ação deliberada, e a fricção extra num app de adesão
> custa exatamente o que ele existe para conseguir — doses registradas.

O que torna a exceção aceitável é a **reversibilidade**: a Home oferece correção óbvia via
`correct-intake`, que é append-only (§4.3). Nada aqui é irreversível.

Se o artigo discute **heurísticas de Nielsen**, este é um caso de tensão explícita entre *Prevenção
de erros* (H5) e *Flexibilidade e eficiência de uso* (H7), resolvida por *Controle e liberdade do
usuário* (H3) — a saída é permitida porque o desfazer existe.

### 5.4 Alarme em tela cheia: dois caminhos, uma tela

`src/notifications/alarme-em-cena.ts`.

Problema real, diagnosticado em aparelho em 09/09: o som saía **duplicado** e a tela piscava ao
responder. Causa: a tela do alarme tem dois pontos de entrada legítimos —

1. **Activity nativa**, montada pelo `fullScreenAction`, sobre a tela de bloqueio, sem passar por
   navegação. É a promessa central do app.
2. **Rota `/alarme/[instante]`**, empurrada quando o evento chega com o app aberto — necessária
   porque nesse caso o Android **rebaixa** o full-screen intent para um *heads-up*, e um aviso
   discreto no topo é o que se ignora sem perceber.

Os dois vivem no mesmo processo JavaScript, então quando o alarme irrompe com o app em segundo plano
**as duas coisas acontecem**: dois players de som, duas telas.

A solução é um registro em **escopo de módulo** (não estado de React), porque os dois lados não
compartilham árvore de componentes — um é `AppRegistry`, o outro é o roteador. O que compartilham é
o módulo. A Activity tem precedência sobre a rota, porque é a que o sistema colocou na frente.

É um bom exemplo, para o artigo, de defeito que **só aparece em aparelho físico** e cuja causa é
arquitetural, não de lógica de negócio.

---

## 6. Stack verificada (para a seção de tecnologias)

Extraído do `package.json` em 10/09/2026:

| Camada | Tecnologia | Versão |
|---|---|---|
| Runtime | Expo | ^57.0.11 |
| | React Native | 0.86.2 |
| Persistência local | `expo-sqlite` | ~57.0.1 |
| Backend / sync | `@supabase/supabase-js` | ^2.112.2 |
| **Avisos e alarmes** | **`react-native-notify-kit`** | **^10.7.0** |
| Criptografia / IDs | `expo-crypto` | ~57.0.1 |
| Câmera (scanner) | `expo-camera` | ~57.0.4 |
| Relatório PDF | `expo-print` + `expo-sharing` | ~57.0.1 / ~57.0.16 |
| Arquivos | `expo-file-system` | ~57.0.5 |

**Migrations:** 18 no total, em `src/data/local/migrations/`. As duas mais recentes (017
`low-stock-alert-state`, 018 `renewal-reminder-enabled`) ainda não rodaram em aparelho.

**Permissões Android declaradas** (`app.json:28-32`): `SCHEDULE_EXACT_ALARM`,
`USE_FULL_SCREEN_INTENT`, `SYSTEM_ALERT_WINDOW`.

---

## 7. Pendências deste documento

Antes de usar no artigo, resolva:

1. 🔖 **Catarata acima dos 65 anos** (>50%) — buscar fonte real.
2. 🔖 **Daltonismo em 1 homem em 12** — buscar fonte real.
3. 🔖 **PSI** — confirmar expectativa da disciplina com o orientador (§4.1).
4. 🔖 **Resolução CFM 1.821/2007 e SBIS/CFM** — verificar aplicabilidade a diário do paciente (§4.3).
5. ⚠️ **`accessibilityHint` em zero** — declarar como trabalho futuro (§1.1).
6. ⚠️ **`expo-notifications` órfão no `package.json`** — remover do código antes da entrega, para o
   artigo e o repositório não se contradizerem.
