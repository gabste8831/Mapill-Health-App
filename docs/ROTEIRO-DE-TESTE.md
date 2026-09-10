# Roteiro de teste em aparelho

> **Este roteiro tem só o que ainda falta validar.** Os blocos 1 a 9 — integridade, restauração,
> exportação, revisão tela a tela, câmera, CMED, relatório em PDF, passe de design e TalkBack —
> foram percorridos em aparelho e aprovados em 08/09, e saíram daqui em 09/09 para o arquivo parar
> de pedir o que já foi feito.
>
> Eles continuam no histórico do git, no commit anterior a este, caso o TCC precise da lista do que
> foi validado.

## O que sobrou, e por quê

| | O que é | Situação |
|---|---|---|
| **10** | Regressão de telas, **só com a fonte no máximo** | Passou em 08/09, mas a tipografia mudou em 09/09 |
| **11 a 17** | A sessão de alarme | **Nunca rodou** — adiada de propósito em 08/09 |
| **18 e 19** | Reboot, bateria e casos de borda | ❌ **Reprovaram** na última rodada |
| **20 e 21** | Avisos de estoque/receita, e o que mudou depois | **Nunca rodou** — nasceram em 08 e 09/09 |
| **22** | Os itens soltos que dependem de um aviso chegar | **Nunca rodou** |
| **23** | Apagar dados de saúde (6.2) | Guardado para o fim: é destrutivo |

**Por que 18 e 19 reprovaram:** o Notifee foi arquivado em 07/04/2026, e o boot receiver dele nunca
era invocado no Android 12+. O app migrou para o fork mantido (`react-native-notify-kit`), então
esta é a primeira build em que a correção pode valer.

## A ordem, e ela não é preferência

**Os blocos 18 e 19 ficam por último.** O 19 mexe no relógio do sistema e reinstala o app; o 18
exige reiniciar o aparelho. Depois deles o estado do celular não serve para mais nada.

Dentro do alarme, o **11 abre a sequência**: é a tela de diagnóstico, e ela responde em cinco
segundos o que antes exigia esperar vinte minutos e adivinhar.

1. **11** — diagnóstico *(primeiro: habilita julgar todo o resto)*
2. **12** — permissões *(rápido, e sem elas nada abaixo funciona)*
3. **20 e 21** — o mais novo, e o que tem mais chance de defeito
4. **13 a 17** — o alarme propriamente
5. **22** — os itens soltos, aproveitando os alarmes já cadastrados
6. **10** — regressão com a fonte no máximo
7. **18 e 19** — por último, pelo motivo acima
8. **23** — apagar tudo, no fim de tudo

> ⏰ **Planeje a véspera.** Compromisso, receita e estoque avisam às **00:01 do dia** — marcar para
> hoje não dispara nada, porque esse instante já passou. Deixe o que for testar cadastrado **na
> noite anterior**, com data para o dia seguinte. Só o alarme de dose toca na hora marcada.
>
> Para testar o encanamento sem esperar a madrugada, o bloco 11 tem botões que disparam cada aviso
> em 30 segundos, no mesmo canal e com o mesmo texto.

## Como reportar

Só o que falhar, com o número do passo:

```
14.2 falhou — a tela cheia não subiu, só veio notificação
16.1 falhou — o alarme do remédio excluído chegou mesmo assim
resto ok
```

- 🔬 marca as perguntas que **só o aparelho responde**. Anote a resposta **mesmo quando passar** —
  são elas que fecham o C1 formalmente no plano.
- Se um passo falhar, os seguintes do mesmo bloco costumam depender dele. Avise e siga para o
  próximo bloco.
- **Se algo dos blocos 1 a 9 falhar agora, é regressão** — use essa palavra, porque muda o
  diagnóstico.

## Antes de começar

⚠️ **Build nova, e desinstale a anterior.** Os motivos se somam:

1. Permissões novas no `app.json` — permissão não entra por recarga do Metro.
2. A biblioteca de avisos é **dependência nativa**, e ela mudou (Notifee → `react-native-notify-kit`).
3. Um canal de notificação já criado fica **congelado** no aparelho: som e importância não mudam por
   atualização. Instalar por cima manteria o alarme mudo — foi assim que o defeito do canal sem som
   sobreviveu a várias sessões.
4. As migrations **017 e 018** nunca rodaram em aparelho. São as primeiras desde a 016.

⚠️ **Aparelho físico.** Emulador não serve para os blocos de alarme — o que está em jogo é o
comportamento do sistema com o app fechado e sob economia de bateria.

```bash
npx expo start --dev-client
```

**Confirme em 10 segundos que é a build certa:** abra `Ajustes → DESENVOLVIMENTO → Diagnóstico de
avisos`. Se a seção "DESENVOLVIMENTO" não existir, a build é antiga.

---

# PARTE 1 — O que falta

## 10 — Regressão com a fonte no máximo

> ⚠️ **Este bloco passou em 08/09 e volta por um motivo só: a tipografia mudou em 09/09.** A caixa
> alta saiu de 86 rótulos, a altura de linha foi corrigida em três tokens, e as cores de estado
> viraram escolha de quem usa.
>
> **A tipografia e as cores foram validadas em aparelho na hora.** O que não foi é a regressão
> **com a fonte do sistema no máximo** — justamente onde mudança de largura e de altura de linha
> aparece. Então: percorra a tabela **direto no tamanho máximo**, e não em uso normal.

**Configurações do Android → Tela → Tamanho da fonte → máximo.** Depois percorra as telas
procurando **texto cortado**, **botão espremido**, **linha sobreposta** e **layout quebrado**.

| Tela                               | O que olhar em especial                                                                                   |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Home**                           | Seções com rótulo, lista compacta das registradas, marca-d'água nos cards cheios, atalhos de uma linha    |
| **Remédios**                       | Seletor sem rolagem, contagem junto da lista, atalho de estoque igual ao da Home, miniatura que **amplia** |
| **Estoque**                        | Card sem local e sem divisor, selo de prazo nos três estados, botões menores, duas ordens (não três)      |
| **Calendário**                     | Dia selecionado **redondo, sem quadrado ao tocar**; barra lateral no card de compromisso; pontos visíveis |
| **Adesão**                         | Faixa "Seus últimos sete dias", bloco azul do número, tabela por medicamento, os dois seletores do PDF    |
| **Compromissos**                   | 🆕 busca, acordeão de anteriores, traço separando, contagem só dos próximos                               |
| **Cadastro de medicamento**        | ⚠️ o mais longo: revelação progressiva, popups, rodapé, sugestões, dias da semana, **anexos que abrem**   |
| **Ajuda de alertas**               | 🆕 tela nova: os quatro assuntos, "Depende do seu aparelho", link dos termos, voltar                      |
| **Cadastro de compromisso**        | Campos, cascata de lembretes, data no passado                                                             |
| **Ficha de saúde**                 | Foto (que **amplia**), contatos de emergência, selos, banner azul, links com alvo de 44pt                 |
| **Horário**                        | Cartão, Tomei/Pulei com estado marcado, "Ignorar por agora"                                               |
| **Alarme**                         | Tela cheia azul, **foto do remédio**, som em loop, as quatro saídas — e a foto **não** amplia             |
| **Ajustes / Conta**                | O hero original — ele inspirou o resto e **não pode ter regredido**; as linhas respondem                  |
| **Login / Consentimento / Termos** | Não foram tocados de propósito: confirmar que continuam iguais                                            |
| **Scanner**                        | Câmera, moldura, entrada manual                                                                           |

🔬 **É aqui que altura travada aparece.** Duas varreduras já acharam o mesmo defeito em lugares
diferentes — sempre onde uma tela desenhou o próprio botão em vez de usar o do kit. Se algum texto
cortar, anote a tela e o elemento: é o mesmo padrão, e a correção é conhecida.

**Dois já anotados em 05/09, que valem reconferir aqui:**

> ⚠️ Os **horários dos cards quebram linha** no máximo.
> ⚠️ A **fonte do nome na lista de remédios** ficou um pouco menor do que deveria.

**Devolva a fonte ao normal ao terminar** — os blocos seguintes não dependem dela.

---

## 11 — A ferramenta de diagnóstico

**Faça este bloco antes de qualquer teste de alarme.** Ela é o que torna os demais suportáveis: em
vez de esperar o horário e adivinhar por que nada tocou, ela mostra o estado real em cinco segundos.

`Ajustes → DESENVOLVIMENTO → Diagnóstico de avisos`.

**14.5.1** Confira as três seções de cima.

> ✅ **Permissões**: "Notificações — Concedida" e "Alarme exato — Permitido", os dois em verde. Se
> algum estiver vermelho, resolva antes de testar qualquer coisa.
> ✅ **Canais**: cada canal com **Som** preenchido (nunca "MUDO") e **Importância** 4 ou 5.
> ✅ **Agendados agora**: o número "no sistema" bate com o "esperado pelo banco".

> **A comparação é o que diagnostica.** Esperados sem agendados = falha ao **agendar**. Agendados
> que não tocam = falha na **entrega**. São causas diferentes, e sem os dois números não dá para
> separar uma da outra.

**14.5.2** Toque em **"Alarme em 30s (tela cheia)"**, e **bloqueie o aparelho**.

> ✅ O aviso aparece na lista de agendados, com o horário certo e o selo "Alarme em tela cheia".
> ✅ 🔴 Em 30 segundos a **tela azul** aparece sobre o bloqueio, com som.

**14.5.3** Repita com **"Notificação em 30s"**, e desta vez **abra outro aplicativo**.

> ✅ Chega como notificação comum, **com som**, sem tomar a tela.

**14.5.4** Toque em **"Refazer a janela de avisos"**.

> ✅ A lista se reconstrói e o número continua batendo com o esperado.
> ✅ 🔴 O aviso de **teste não some** — ele sobrevive ao reagendamento de propósito, senão morreria
> no gesto que o próprio teste pede (sair do app).

---

## 12 — As permissões do alarme

**Faça primeiro.** Sem elas nada abaixo funciona, e o app agora conduz o processo inteiro.

**0.1** Abra o app com pelo menos um remédio cadastrado com lembrete.

> ✅ 🔴 Painel na Home listando o que falta autorizar, **antes da agenda**.
> ✅ Cada linha diz a **consequência** ("Sem isto o aviso pode atrasar dezenas de minutos"), e não o
> nome técnico da permissão.
> ✅ As que impedem o alarme de tocar trazem o selo **OBRIGATÓRIO**.

**0.2** Toque em cada linha e conceda.

> ✅ 🔴 Cada uma abre a **tela certa** do Android — não a tela genérica do app.
> ✅ 🔴 Voltando ao Mapill, a linha concedida **some sozinha** do painel.

**0.3** Com tudo concedido:

> ✅ 🔴 O painel **desaparece por completo**.

🔬 **Anote:** quantas das quatro seu aparelho pediu? (Depende da versão do Android e do fabricante.)

---

## 13 — 🔴 As cinco correções que só esta build pode provar

Cinco defeitos corrigidos no código que **ainda não passaram em binário**. São o coração do TCC —
mas ficam no fim da sessão de propósito, junto do resto do alarme, porque os blocos vizinhos mexem
no relógio e reinstalam o app.

> **Antes de esperar qualquer horário, abra o diagnóstico** (`Ajustes → Desenvolvimento`). Ele diz
> se o aviso está agendado, para quando, em que canal e com quais permissões. Um alarme que não
> aparece ali nunca ia tocar — e descobrir isso custa cinco segundos em vez de vinte minutos.

**1. A tela azul sobre outro aplicativo** 🔴. Cadastre um remédio com alarme para daqui a 2 minutos.
**Abra o Instagram** (ou qualquer outro app) e fique navegando.

> 🔬 A tela azul do alarme aparece **por cima** do outro aplicativo?
>
> Antes só a notificação no topo aparecia. A correção é a permissão `SYSTEM_ALERT_WINDOW`, que é
> justamente o que exige build nova — no binário anterior ela nem existia no manifesto. Confirme
> antes em **Ajustes → alertas** que a permissão de "abrir sobre outros apps" está concedida.
>
> Se **não** funcionar, teste o paliativo: tocar na notificação abre a **tela do alarme** (com foto,
> adiar, silenciar) e não a de confirmação.

**2. O alarme adiado toca na hora** 🔴. Deixe um alarme tocar, toque em **"Adiar 5 minutos"** e
**bloqueie o celular**. Não toque nele.

> 🔬 Ele volta a tocar em 5 minutos, com a tela ainda apagada?
>
> Antes só tocava quando o celular era desbloqueado — o Android agrupava o alarme no Doze. Agora usa
> a mesma categoria do despertador nativo.

**3. A notificação tem som** 🔴. Cadastre um remédio com lembrete **de notificação** (não alarme),
com o volume do celular alto.

> 🔬 A notificação chega **com som**?
>
> O canal era criado mudo por um engano de leitura da documentação. Como canal no Android é imutável
> depois de criado, o app agora apaga e recria o canal — então esta é a primeira instalação em que a
> correção pode valer.

**4. A notificação chega com a tela desligada** 🔴. Mesmo cadastro do item 3, mas **bloqueie o
celular** e espere.

> 🔬 Ela chega no horário, sem precisar ligar a tela?

**5. Os botões da notificação** 🔴. Arraste a notificação para baixo, se necessário.

> 🔬 Aparecem **"Tomei"** e **"Pulei"** — e não mais "Adiar".
> 🔬 Tocar em "Pulei" registra a dose como pulada (confira na Home e na tela de adesão).

> **Se algum destes cinco falhar**, anote exatamente o que aconteceu e em que estado estava o
> celular (bloqueado, em uso, com qual app aberto). São defeitos de plataforma, e o estado é metade
> do diagnóstico.

---

## 14 — O alarme em tela cheia 🔴🔬

**O diferencial do app, e o que motivou esta build.** Até aqui o "alarme" era uma notificação de
alta prioridade — tocava uma vez e parava. Agora é um despertador de verdade: abre a tela, toca em
loop, e alguém precisa vir desligar.

**1.1** Cadastre `Teste Alarme`, dose `1`, Todo dia, 1×, horário **daqui a 3 min**, uso contínuo,
lembrete **Alarme**.

**1.2** **Feche o app** completamente (recentes, deslize para fora) e **bloqueie o celular**. Espere.

> ✅ 🔴 **Uma tela azul ocupa o aparelho inteiro**, por cima da tela de bloqueio.
> ✅ 🔴 **O som toca em loop** e não para sozinho.
> ✅ 🔴 Mostra a hora em número grande e o nome do remédio com a dose.
> ✅ 🔴 Tem os botões **Silenciar**, **Tomei**, **Pulei** e **Responder depois**.
> ❌ Se vier só uma notificação na barra, a tela cheia não subiu — anote e siga para o 1.5.

🔬 **Anote:** a tela apareceu com o celular **bloqueado**, ou só depois de desbloquear?

**1.3** 🔴 Toque em **Silenciar**.

> ✅ 🔴 O som **para na hora**.
> ✅ 🔴 A tela **continua aberta**, dizendo que a dose ainda espera resposta.
> ✅ O botão some — não há o que silenciar duas vezes.

**1.4** 🔴 Toque em **Tomei**.

> ✅ 🔴 A tela fecha.
> ✅ 🔴 Abrindo o app, a dose aparece **confirmada** na Home.
> ✅ 🔴 O estoque descontou.

**1.5** Cadastre outro para daqui a 3 min, com lembrete **Notificação** (não alarme). Feche o app.

> ✅ 🔴 Chega uma **notificação comum** na barra — **sem** tela cheia.
> ✅ É a diferença entre as duas opções: uma avisa, a outra acorda.

🔬 **Anote:** a diferença entre os dois modos ficou clara?

---

## 15 — Os botões da notificação

Aqui estavam dois defeitos de 29/08: cinco toques em "Adiar" geravam **cinco** lembretes, e o
estoque descontava 1 em vez da dose.

⚠️ **Use lembrete `Notificação` neste bloco inteiro.** Os botões de ação vivem na notificação, e o
modo `Alarme` agora abre a tela cheia em vez de mostrar uma — o que ele faz está no bloco 14.

**2.1** Cadastre `Teste Botao`, dose **2**, daqui a 3 min, estoque **20**, **Notificação**. Feche o
app. Quando chegar, toque em **Tomei**.

> ✅ A notificação some e o app **não abre**.
> ✅ Abrindo depois, a dose está **confirmada** na Home.
> ✅ O estoque caiu **2** (a dose), e não 1.

**2.2** Cadastre outro para daqui a 3 min. Quando chegar, toque em **Adiar 5 min** — e toque
**várias vezes** se a notificação não sumir na hora.

> ✅ Volta **uma única vez**, 5 min depois. Não cinco.
> ✅ Na volta, o botão **"Adiar" não existe mais** — só "Tomei".

**2.3** **Antes** de o aviso adiado voltar, abra a Home.

> ✅ A dose continua **pendente** — nem pulada, nem confirmada. Adiar não registra desfecho.

**2.4** Ainda antes de ele voltar, **confirme essa dose pela Home**.

> ✅ O aviso adiado **não menciona esse remédio** (ou não chega, se era o único).

**2.5 — 🔴 O ganho da unificação: gravar com o app fechado.** Cadastre outro para daqui a 3 min,
**Notificação**. Feche o app. Quando o aviso chegar, toque em **Tomei** e **não abra o app**.

Espere um minuto, e só então abra.

> ✅ 🔴 A dose **já está confirmada** ao abrir — a gravação aconteceu no toque, não na abertura.
> ✅ 🔴 O estoque **já tinha descontado**.
> ❌ Se a dose só aparecer confirmada _depois_ de abrir o app, o handler de segundo plano não está
> registrado. É o que o `index.js` faz antes de o roteador subir.

**2.6 — O adiado sobrevive ao reagendamento.** Cadastre um para daqui a 3 min. Quando chegar, toque
em **Adiar 5 min**. Em seguida **abra o app** (o que dispara um reagendamento completo) e feche.

> ✅ 🔴 O aviso adiado **ainda chega**, ~5 min depois do toque.
> ❌ Se não chegar, o `cancelarTudo` o apagou junto com a grade — era exatamente o defeito que a
> migração introduziria se o filtro de id olhasse só o prefixo `adiado-`, já que o adiado é agendado
> como alarme e seu id fica `alarme:adiado-…`.

---

## 16 — Nada de alarme órfão

**O pior defeito possível: lembrete de um remédio que a pessoa já parou de tomar.**

Este bloco ficou **mais importante** nesta build: agora existem dois agendadores (o Notifee para o
alarme, o `expo-notifications` para o resto), e cada um só enxerga a própria lista. Se o
cancelamento esquecer um dos dois lados, o alarme de um tratamento excluído continua tocando.

**3.1** Cadastre `Vai Sumir`, daqui a 5 min, **Alarme**. **Exclua o medicamento.** Feche o app.

> ✅ 🔴 **Nada acontece no horário** — nem tela cheia, nem notificação.

**3.2** Cadastre `Vai Mudar`, daqui a 4 min, Alarme. **Edite** para daqui a 10 min. Feche o app.

> ✅ Nada no horário antigo; chega no novo.

**3.3** Cadastre `Vai Desligar`, daqui a 4 min. Edite e **feche o popup de lembrete sem escolher
nada**. Feche o app.

> ✅ Nada chega. Não configurar já é recusar.

---

## 17 — Vários remédios no mesmo horário

**4.1** Cadastre **dois** para daqui a 4 min: `Losartana` (dose 1) e `Metformina` (dose 2),
**Alarme** nos dois. Feche o app.

> ✅ 🔴 Abre **UMA tela de alarme só**, não duas.
> ✅ 🔴 Ela lista **os dois remédios**, cada um com sua dose.
> ✅ Os botões dizem **"Tomei todas"** e **"Pulei todas"**.

**4.2** Toque em **Tomei todas**. Vá ao estoque.

> ✅ 🔴 Os **dois** descontaram.

**4.3** Repita o cadastro dos dois, agora com **Notificação**, e toque no **corpo** da notificação
(não nos botões).

> ✅ Chega **uma notificação só**, título **"Hora dos seus remédios (2)"**, uma linha por remédio.
> ✅ Abre a tela **"Hora do remédio"**, com **Tomei** e **Pulei** próprios de cada um.
> ✅ **Tomei** só na Losartana e **Pulei** na Metformina: só a Losartana desconta.

---

## 18 — Sobrevivência a reboot e bateria 🔬

**Decide se o app precisa de uma tela orientando a desativar a otimização de bateria.**

**7.1** Cadastre um remédio com **4 horários/dia**, uso contínuo, Alarme. Abra o app, deixe
carregar, feche. _(Isso agenda ~28 avisos.)_

**7.2** 🔬 **Reinicie o celular.** **Não abra o app** e espere o próximo horário.

> ✅ A notificação chega mesmo depois do reboot, sem o app ter sido aberto.
> ❌ Se não chegar, dependemos do app ser aberto após cada reboot — anote.

**7.3** 🔬 **O mais chato:** deixe um remédio agendado para **daqui a 8–12 h** (a noite serve),
celular **sem carregador**, app fechado, economia de bateria do fabricante ativa.

🔬 **Anote:** chegou? No horário ou atrasado? _(Xiaomi, Samsung e Motorola são os mais agressivos.)_

---

## 19 — Os casos de borda do alarme 🔬 (C1.8)

**É o bloco que fecha o C1 no plano.** Os blocos 13 a 17 provam que o alarme funciona quando tudo
está normal; este prova que ele não **mente** quando não está. Num app de medicação, os dois modos
de falhar são opostos e igualmente graves: o aviso que **não chega**, e o aviso que chega **errado**
— na hora errada, duplicado, ou de um remédio que a pessoa já tomou.

Cada passo tem um número de C1.8 ao lado. Anote a resposta **mesmo quando passar**: são elas que
marcam as caixas do plano.

⚠️ **Este bloco mexe no relógio do aparelho e reinstala o app.** Faça-o **por último** na Parte 1 —
depois dele o estado do aparelho não serve para os outros blocos.

---

**11.1 — Dose já confirmada não toca** _(C1.8 nº6)_

Cadastre `Tomei Antes`, daqui a 4 min, **Alarme**. Abra a Home e **confirme a dose pela Home**,
antes do horário. Feche o app e espere passar o horário.

> ✅ 🔴 **Nada toca.** Nem tela cheia, nem notificação.
> ❌ Se tocar, o cancelamento individual não alcançou o Notifee — é o mesmo risco do bloco 16, e o
> mais provável de escapar, porque aqui quem cancela é a Home e não a edição do cadastro.

---

**11.2 — Alarme com o app já aberto na tela da dose** _(C1.8 nº5)_

Cadastre `App Aberto`, daqui a 3 min, **Alarme**. **Deixe o app aberto**, e navegue até a tela do
horário dessa mesma dose. Espere o horário.

> ✅ 🔴 A tela de alarme aparece **mesmo com o app aberto** _(é o que o commit de 02/09 entregou)_.
> ✅ 🔴 **Não empilha duas telas** — ao sair do alarme você não encontra outra tela de dose por baixo
> esperando resposta da mesma dose.
> ✅ Respondendo **Tomei** no alarme, a tela por baixo reflete a resposta, e não continua oferecendo
> Tomei/Pulei para uma dose já resolvida.

🔬 **Anote:** aconteceu de responder duas vezes a mesma dose?

---

**11.3 — Dose atravessando a meia-noite** _(C1.8 nº2)_

Cadastre `Meia Noite` com **dois horários**: `23:50` e `00:10`. Uso contínuo, Alarme.

> ✅ Os dois horários são aceitos e aparecem no resumo do cadastro.
> ✅ 🔴 Na Home, a dose das `00:10` aparece **no dia seguinte**, não hoje.

Se der para esperar a virada, espere. Se não, ajuste os horários para daqui a 3 e 8 min e confirme
que os dois tocam — o que este passo testa de verdade é a geração, e ela já foi verificada em Node
contra a virada de dia.

🔬 **Anote:** a dose de `00:10` foi listada no dia certo?

---

**11.4 — Não perturbe / Foco** _(C1.8 nº4)_

Cadastre `Silencioso`, daqui a 3 min, **Alarme**. Ative o **Não perturbe** do Android. Feche o app e
bloqueie.

> ✅ 🔴 **O alarme toca mesmo assim** — é o que `bypassDnd` e a permissão de política de notificação
> existem para garantir _(commit `5747ed9`)_.
> ❌ Se ficar mudo, anote: é a diferença entre o app cumprir ou não a promessa "toca alto, mesmo no
> silencioso" — e, pela RN15, o **texto da interface teria que mudar**, não a promessa ficar.

Repita com o celular no **silencioso** (não o Não perturbe — o botão de volume no mudo).

> ✅ 🔴 Toca igual.

🔬 **Anote os dois casos separadamente.** Eles falham por motivos diferentes.

---

**11.4b — 🔴🔬 O tratamento contínuo sobrevive a 30 dias?** _(suspeita, não confirmada)_

Este passo é novo e existe para responder uma dúvida achada por leitura de código, não por teste.

As doses (`DoseSchedule`) são gravadas no banco em blocos de **30 dias**, no cadastro. O comentário
do `SCHEDULE_HORIZON_DAYS` diz que a janela "é reabastecida depois", mas não foi encontrado nenhum
código que faça isso. Se a suspeita se confirmar, num uso contínuo **os avisos param por volta do
30º dia**, mesmo com o app sendo aberto todos os dias, e sem nenhum sinal.

Você já vai estar com a hora automática desligada no passo seguinte, então o custo aqui é pequeno.

Cadastre um remédio **de uso contínuo**, 1x/dia. Abra `Ajustes → Desenvolvimento → Diagnóstico` e
anote quantas doses o banco espera. Depois adiante o relógio em **31 dias** e volte à Home.

> ✅ 🔴 A Home continua mostrando a dose do dia.
> ✅ O diagnóstico continua com avisos agendados, e o número não é zero.
> ❌ Se a Home ficar vazia ou o diagnóstico zerar, a suspeita se confirma — e é o pior modo de
> falhar deste app, porque nada avisa que parou.

🔬 **Anote o resultado mesmo se passar:** ele decide se é preciso implementar o reabastecimento ou
se existe um caminho que a leitura do código não encontrou.

**Devolva a hora automática** antes de seguir, ou faça o 11.5 na sequência aproveitando o relógio
já desligado.

---

**11.5 — Relógio do aparelho mudado à mão** _(C1.8 nº3)_

Cadastre `Relogio`, daqui a **2 h**, Alarme. Feche o app. Nas configurações do Android, **desligue a
hora automática** e adiante o relógio para **5 minutos antes** do horário da dose. Espere.

> ✅ O aviso chega no horário **do relógio novo** — o agendamento é por data/hora local, então ele
> acompanha.
> ⚠️ Se **não** chegar, anote e verifique se ele chega ao **abrir o app** (o reagendamento da janela
> acontece na abertura). Isso decide se o app precisa reagir à mudança de relógio ou se basta a
> próxima abertura.

**Devolva a hora automática ao terminar** — os passos seguintes dependem do relógio certo.

🔬 **Anote:** chegou sozinho, só ao abrir o app, ou não chegou?

---

**11.6 — Fuso horário** _(C1.8 nº1)_

Com a hora automática **desligada**, mude o **fuso** para um vizinho (ex.: Fortaleza / Manaus). Abra
o app.

> ✅ 🔴 A dose das 08:00 **continua às 08:00** na Home — o horário é uma promessa sobre o relógio de
> parede da pessoa, não um instante absoluto. Quem toma remédio às 8 da manhã toma às 8 da manhã em
> qualquer lugar.
> ❌ Se a dose escorregar para 07:00 ou 09:00, anote — é o defeito mais sutil deste bloco.

**Devolva o fuso** ao terminar.

🔬 **Anote:** o horário escorregou?

---

**11.7 — App reinstalado** _(C1.8 nº9)_

Com pelo menos um remédio cadastrado com alarme para daqui a algumas horas: **desinstale o Mapill**
e instale a build de novo. **Não abra o app.** Espere o horário.

> ✅ **Nada chega** — e isso é o comportamento **correto**: desinstalar leva embora os agendamentos
> do sistema junto com o app.

Agora **abra o app** uma vez e feche.

> ✅ 🔴 A partir daí os avisos **voltam a chegar**, sem precisar reeditar nada. É o reagendamento da
> janela na abertura.
> ❌ Se não voltarem, existe um caminho em que a pessoa fica sem lembrete nenhum e **sem nenhum
> sinal disso** — é o pior modo de falhar deste app.

⚠️ Este passo **apaga os dados locais** se você não tiver conta vinculada. Faça-o por último, ou
depois de conferir que a sincronizacao ja restaurou (bloco 1, aprovado em 08/09).

🔬 **Anote:** voltaram após a primeira abertura?

---

**11.8 — Bateria crítica** _(C1.8 nº8)_

Não force. **Se em algum momento da semana o celular chegar abaixo de 15% com a economia extrema
ligada** e houver dose agendada, anote se o aviso chegou.

🔬 **Anote se acontecer naturalmente.** Não vale gastar uma sessão descarregando o aparelho de
propósito.

---

**Fecha o quê:** os nove casos do C1.8. Com 11.1 a 11.7 anotados, a caixa _"Checklist de borda
percorrido"_ do plano fecha — 11.8 é oportunista e pode ficar como "não observado".

---

## 20 — Os avisos de estoque e de receita (08/09) 🆕

Até 08/09 o app prometia quatro lembretes e entregava três: quem marcava _"me avisar quando estiver
acabando"_ recebia só o cartão da tela inicial. Agora o estoque também notifica, e a receita ganhou
um segundo aviso no dia em que vence.

> ⏰ **O aviso cai às 00:01 do dia, não na hora em que você cadastra.**
>
> Isso vale para compromisso, receita e estoque — os três são avisos de planejamento, não alarmes:
> a intenção é que já estejam na tela quando a pessoa pegar o celular pela primeira vez no dia.
>
> **Consequência para o teste:** marcar qualquer coisa para **hoje** não dispara nada, porque 00:01
> de hoje já passou. Para ver um aviso chegar, marque para **amanhã** e confira de manhã. Para
> testar o encanamento sem esperar, use "Notificação em 30s" no bloco 11.

### As contas, para montar o teste

O aviso **"acabando"** cai em: hoje + (dias que o estoque dura − antecedência escolhida).
O aviso **"acabou"** cai em: hoje + dias que o estoque dura.
A **receita** é direta: validade − antecedência, e a validade em si.

As antecedências oferecidas são **3, 7, 15 e 30 dias** (estoque) e **7, 15 e 30** (receita) — não há
opção de 1 dia, então a quantidade é o que se ajusta.

**Para tudo cair amanhã**, com quatro remédios:

| # | O que cadastrar | Aviso que chega amanhã |
|---|---|---|
| 1 | 8 comprimidos, 1x/dia, avisar **7 dias** antes | "está acabando" |
| 2 | 2 comprimidos, 1x/dia, avisar **7 dias** antes | "acaba hoje" (a janela já passou) |
| 3 | Receita válida até **16/09**, avisar **7 dias** antes | "vencendo" |
| 4 | Receita válida até **amanhã**, avisar **7 dias** antes | "vence hoje" (a janela já passou) |

> ⚠️ **A dose precisa ter horário ainda por vir hoje.** Cadastrando à noite com dose às 08:00, a de
> hoje já passou e a contagem começa amanhã — o que empurra tudo um dia.

**20.1 — O estoque avisa** 🔴. Monte os remédios 1 e 2 da tabela acima.

> ✅ A frase abaixo da antecedência diz que o aviso aparece na tela inicial **e** como notificação,
> e que são dois — ao entrar na antecedência e quando o estoque acabar.
> ✅ 🔴 No dia seguinte, a notificação chegou (silenciosa, sem botões de confirmar/pular).
> ✅ O título diz **o nome do remédio**, e não só "Estoque acabando" — é o que sobrevive quando a
> tela de bloqueio esconde o conteúdo.
> ✅ O cartão da tela inicial continua lá, independente da notificação.

**20.1b — Marcar sem escolher prazo** 🔴🔬 — a correção de 08/09.

Marque _"Me avisar quando estiver acabando"_ e **não toque** no seletor de antecedência. O mesmo na
receita, com _"Me avisar quando a receita vencer"_.

> ✅ 🔴 O aviso **existe**: chega no dia em que o estoque acaba (ou em que a receita vence).
> ✅ A frase abaixo diz isso — "você será avisado no dia em que...", com o convite a escolher um
> prazo para saber antes.
> ✅ Na lista de estoque, a linha do remédio diz **"Avisar quando acabar"**, e não "Sem aviso".
>
> 🔬 Até 08/09 este caso produzia **silêncio total**: marcar sem prazo gravava o aviso ligado e
> nulo, e o planejador descartava o item inteiro. A interface confirmava uma intenção que o app não
> cumpria.

**20.2 — A trava** 🔴🔬 — **o passo mais importante deste bloco.**

Com o estoque baixo, **confirme várias doses seguidas**.

> ✅ 🔴 Chega **uma** notificação, não uma por confirmação.
>
> 🔬 A previsão de estoque é recalculada a cada dose, então sem trava cada toque geraria um aviso
> novo. Se chegarem várias, a trava falhou — e é o defeito mais grave possível aqui, porque leva a
> pessoa a desligar as notificações do app e perder junto os alarmes de dose.

Agora **reponha** o estoque (tela de Estoque → "Repor"), e deixe baixar de novo.

> ✅ Volta a avisar. Repor é o único gesto que rearma o aviso; consumir mais não.

**20.3 — A receita avisa duas vezes.** Monte os remédios 3 e 4 da tabela.

> ✅ A frase diz que são dois lembretes: na antecedência e no dia do vencimento.
> ✅ Amanhã chegam "Receita de X vencendo" e "Receita de Y vence hoje".
> ✅ O nome do remédio está no **título** dos dois.

**20.3b — Os quatro avisos sem esperar a madrugada** 🔬. `Ajustes → DESENVOLVIMENTO → Diagnóstico`.

Os quatro botões novos ("Estoque acabando", "Estoque acabou", "Receita vencendo", "Receita vence
hoje") disparam em 30s, no mesmo canal e com o mesmo texto do aviso real.

> ✅ Cada um chega com **som**, e a frase cabe na barra sem truncar no meio da palavra.
> ✅ Com o aparelho bloqueado, o comportamento é o esperado — o canal de lembrete é `PRIVATE`, então
> o conteúdo fica oculto se o aparelho estiver configurado para esconder informação sensível. Isso
> **não é defeito**: o nome do remédio na tela de bloqueio revela condição clínica.
> ✅ No painel, "Esperados pelo banco" mostra os quatro tipos separados (doses, compromissos,
> receitas, estoques), e os números batem com o que foi cadastrado.

**20.4 — O calendário mostra os dois.** Abra o calendário e navegue até os dias acima.

> ✅ A validade da receita aparece como **"Receita de X vence"**.
> ✅ O fim do estoque aparece como **"Estoque de X deve acabar por volta desta data"** — a redação
> é diferente de propósito: é projeção, não fato.
> ✅ Os dois são discretos: sem cartão, sem fundo próprio, sem toque. Não há o que confirmar.
> ✅ 🔴 Filtrando por "Compromissos" ou "Remédios", eles **continuam aparecendo** — não são nem um
> nem outro, e sumir ao filtrar esconderia o que ninguém pediu para esconder.

**20.5 — As migrations** 🔬. Este bloco trouxe a `017` e a `018`, as primeiras desde a `016`.

> ✅ O app abre sem erro de banco, e o estoque cadastrado antes continua lá com os mesmos números.
> ✅ 🔴 Um remédio que **já tinha** aviso de receita configurado antes de 08/09 continua avisando —
> a `018` migra as linhas existentes como "quer ser avisado", porque marcar a caixa era o único
> caminho que produzia aquele estado.

---

## 21 — O que a revisão de 08/09 mudou depois de aprovada 🆕

Estes itens foram alterados **depois** que os blocos 1 a 10 passaram. O que falhar aqui é defeito
novo, não regressão — vale usar essa palavra ao reportar.

**21.1 — A miniatura da mídia** 🔴. Ficha sem foto → adicione a primeira.

> ✅ 🔴 Aparece **na hora**, sem sair e voltar. O mesmo na foto da caixa e no anexo da receita.
> ✅ Trocar uma foto existente continua funcionando.
> ✅ O quadro vazio ainda tem a borda tracejada com o ícone centralizado.

**21.2 — A foto da ficha chega às outras telas.** Ficha → adicione foto → salve → **Ajustes**.

> ✅ A foto está no avatar do topo, sem precisar reabrir o app.

**21.3 — Os rótulos dos anexos.**

> ✅ "Excluir" em vermelho ao lado de "Trocar foto" / "Alterar anexo".
> ✅ A foto da caixa tem "Excluir", que antes não existia.
> ✅ Com a fonte do sistema no máximo, a linha **não quebra**.

**21.4 — O campo de data.** Anexe uma receita e olhe "RECEITA VÁLIDA ATÉ".

> ✅ Ocupa a linha inteira, com o calendário encostado na borda direita.
> ✅ Os outros quatro `DateField` do app seguem alinhados (data de nascimento, DATA do compromisso,
> "PRIMEIRO DIA DESTE CICLO", "QUANDO COMEÇA").

**21.5 — A navegação do estoque.** Home → Estoque → "Ver minhas medicações".

> ✅ Vai para a **listagem de remédios**, não para a Home.
> ✅ A seta ⟵ do topo continua voltando para de onde você veio.

**21.6 — A tela azul do dia completo** 🔴.

> ✅ Confirmando a última dose **na Home**: a tela azul aparece e some sozinha em ~3s.
> ✅ 🔴 Respondendo a última dose **na tela do alarme**: ela **não** aparece ao voltar.
> ✅ 🔴 Navegando entre telas com o dia já completo: não aparece.
> ✅ Fechando e reabrindo o app com o dia completo: não aparece.

**21.7 — O amarelo dos alertas** 🔬. Cadastro → LEMBRETE, com alguma permissão faltando.

> ✅ O painel de permissões usa o mesmo amarelo do lembrete de recontagem da tela de estoque.
> 🔬 Se ele parecer **apagado demais** contra o fundo branco do popup, anote: o token puro é quase
> branco, e a mistura que o encorpava foi removida em favor da padronização.

---


## 22 — Os itens soltos que dependem de um aviso

Estes cinco moravam nos blocos 3, 5 e 8, que já passaram. Ficaram de fora porque cada um exige um
aviso chegar — e foram reunidos aqui para caberem numa sessão só, aproveitando os alarmes que os
blocos 13 a 17 já pedem cadastrados.

**22.1 — A notificação do compromisso** 🔬🔴 _(era 3-C3)_. **Nunca funcionou em binário.** Cadastre
um compromisso com lembrete "no dia" e espere a virada.

> 🔬 🔴 **A notificação chega?** Se não chegar, é o mesmo defeito do canal mudo dos remédios — a
> correção está no código desde a build anterior.
> ⚠️ O aviso cai às **00:01**, não às 8h: o texto antigo do roteiro dizia 8h, e mudou em 08/09.
> Uma consulta às 06:00 recebia o aviso "no dia" duas horas **depois** de ela já ter começado.

**22.2 — O local no alarme** 🔬 _(era 3-G1)_. Cadastre um remédio com estoque e preencha **onde ele
fica guardado**. Dispare o alarme.

> 🔬 Abaixo da dose aparece um ícone de localização com o texto ("armário da cozinha").
> ✅ Ele é pequeno — o horário e o nome continuam sendo o que se lê de longe.

**22.3 — O aviso do compromisso excluído** 🔴 _(era 5/10.4)_. Calendário → **+** → compromisso para
amanhã, com lembrete. Depois **exclua o compromisso**.

> ✅ 🔴 O aviso dele **não chega**. _(Órfão, agora para compromisso.)_
> ✅ O texto do cadastro diz que os avisos chegam **às 00:01**, e não "às 8 da manhã".
> ❌ Se disser que os lembretes "ainda estão sendo desenvolvidos", o texto é antigo.

**22.4 — A foto no alarme** _(era 8-F)_. Cadastre um remédio **com foto** da caixa e alarme para
+3 min.

> ✅ 🔴 A foto aparece na tela do alarme, larga, acima do nome.
> ✅ Um remédio **sem** foto não deixa espaço vazio nem quebra o layout.

**22.5 — O alarme não tem visualizador** 🔬 _(era 8-K6)_, **e isso é de propósito.** Com um alarme
tocando, toque na foto do remédio.

> ✅ 🔴 **Nada acontece.** Abrir uma camada por cima de um alarme daria uma saída que não responde a
> dose nenhuma.

**22.6 — Os quatro temas** 🔬 _(era 3-A4)_. Ajustes → Configurações de tema. Percorra Home e Estoque
em cada um.

> 🔬 **Só o tema padrão foi revisado em aparelho.** Escuro, alto contraste e daltonismo receberam os
> tokens novos com valores conferidos por contraste, mas não foram vistos. Anote o que destoar — está
> registrado como pendência de refinamento.
> ⚠️ A rodada de 09/09 mexeu nas cores de estado (viraram escolha de quem usa) e na tipografia, o
> que torna este item mais relevante do que era.

---

## 23 — Apagar os dados de saúde 🔬

⚠️ **Por último. Este passo apaga tudo.**

**23.1** **Com a conta vinculada**: Ajustes → Conta e dados → **"Apagar meus dados de saúde"** →
confirme.

> ✅ Os remédios somem.
> ✅ 🔬 **O que importa:** feche o app, abra e espere sincronizar. Eles **não voltam**.
> ❌ Se voltarem, o apagamento na nuvem falhou — avise.

---

## Ao terminar a Parte 1

Me manda: **(1)** as falhas com o número do passo, **(2)** as respostas dos 🔬, mesmo as que
passaram. Com isso o C1 fecha formalmente, e o próximo passo é capturar os prints do caminho
crítico para o TCC.

---

---


# PARTE 2 — Passada geral

> **Não é para agora.** É a passada final antes da defesa, com o app fechado. Percorre tudo do zero,
> como quem nunca o abriu. Começa apagando tudo e termina apagando tudo de novo — o primeiro
> apagamento é para chegar ao zero, o último testa o direito de exclusão (LGPD).
>
> **Percorrer na ordem:** os cadastros do começo alimentam os testes do meio. Dá para parar entre
> sessões, não dentro de uma.

| Sessão            | O que cobre                                         | Tempo   |
| ----------------- | --------------------------------------------------- | ------- |
| **1 — Entrar**    | apagamento, os dois logins, ficha, termos           | ~20 min |
| **2 — Cadastrar** | formas farmacêuticas, frequências, anexos, lembrete | ~50 min |
| **3 — Usar**      | listagem, Home, estoque, calendário, compromissos   | ~40 min |
| **4 — Sair**      | conta, apagamento parcial e total                   | ~15 min |

**De onde vem o login com Google:** o `.env` **não sobe para o EAS** (está no `.easignore`). Numa
build `preview`/`production`, as credenciais vêm das variáveis do servidor EAS; numa `development`
com `npx expo start --dev-client`, vêm do `.env` local. Se o login disser "indisponível nesta
versão", é aqui que se olha primeiro (`eas env:list --environment preview`).

---

## SESSÃO 1 — Entrar

**1.1** **Ajustes** → **MEUS DADOS** → **"Apagar tudo e recomeçar"** → Continuar → Apagar tudo.

> ✅ O app volta para a **tela de login**, como recém-instalado.
> ✅ O segundo diálogo **repete o que acontece** — não só "tem certeza?".

**1.2** **"Continuar sem login"** → no consentimento, toque na **seta de voltar**.

> ✅ Volta para o login. A escolha de entrada é arrependível.

**1.3** Entre de novo, aceite os termos, e na ficha toque no **botão físico de voltar**.

> ✅ Volta para o consentimento, **não** fecha o app.

**1.4** Zere e teste o outro caminho: **"Continuar com Google"** → **feche o navegador sem escolher
conta**.

> ✅ Volta ao app com aviso de login cancelado. Não trava nem entra em silêncio.

**1.5** Entre com o Google de verdade, complete a ficha. Feche o app (recentes) e reabra **três
vezes**.

> ✅ Vai direto para a Home; a tela de login **não pisca** antes.
> ✅ A splash azul **sai sozinha** — nunca fica presa nela.

**1.6** **Ajustes** → bloco azul da ficha.

> ✅ **DATA DE NASCIMENTO** tem ícone de calendário **e** aceita digitação.
> ✅ `29/02/2025` é recusado; datas futuras apagadas no calendário.
> ✅ Tocando na foto, abre "Tirar foto agora" / "Escolher da galeria".

**1.7** **Conta e dados** → **Termos e privacidade**.

> ✅ Ícone de **pessoa** (não o logo do Google); "Aceito em" com data e horário.

---

## SESSÃO 2 — Cadastrar

**2.1 — O caso comum.** `Losartana 50mg`, comprimido, dose 1, Todo dia, 2×, `08:00` e `20:00`, uso
contínuo, estoque 28, local `Gaveta da cozinha`, avisar com 7 dias.

> ✅ No popup de horários abrem **dois campos numéricos**, não o mostrador redondo.
> ✅ É 24 h: `20` dá 20:00, sem AM/PM. `99` vira 23. `7` vira 07.
> ✅ Em "Pronto", **o teclado fecha junto** com o popup.
> ✅ Horário duplicado é barrado.

**2.2 — Unidade ambígua.** `Xarope`, **Líquido**.

> ✅ Aparece **"COMO A DOSE É MEDIDA?"** antes da quantidade.
> ✅ A dica do copinho tem fundo **amarelo claro** com barra viva à esquerda.
> ✅ Em **ml**, dose `7,5` — a fração é aceita.

**2.3 — Dependência entre campos.** Com `7,5` preenchido, volte e troque a forma para **Comprimido**.

> ✅ O campo de dose **fica vazio** — comprimido não aceita fração.

**2.4** Escolha **"Prazo definido"**, 7 dias. Troque para **"Uso contínuo"** e volte.

> ✅ O campo de dias está **vazio** — o 7 não voltou sozinho.

**2.5 — Dose que varia.** `Insulina NPH`, Injeção, UI, dose 10, Todo dia, 2×.

> ✅ Existe **"A dose muda de um horário para o outro"**. Marque: `08:00` com 10, `22:00` com 8.
> ✅ Em "Preencher de X em X horas", uma frase diz que **as doses por horário são mantidas**.

**2.6 — Frequências.** `Metformina` em **Dias da semana** (Seg/Qua/Sex, 12:00), e um com **ciclo**
21/7 cadastrado no meio da cartela.

> ✅ Funcionam; "dias ativos > tamanho do ciclo" é barrado.

**2.7 — Só quando precisar.** `Dipirona`, Gotas, dose 30 gotas, estoque 20 **ml**.

> ✅ Sem horário e sem data de início; o tempo vira "Sempre disponível".
> ✅ O estoque pergunta em **ml**, não em gotas.

**2.8 — Anexos.** Na Losartana, seção **ANEXOS**.

> ✅ A foto da caixa aparece **na hora** (não branca), e muda **toda vez** que você troca.
> ✅ **RECEITA MÉDICA** abre popup com **três** origens: câmera, galeria e arquivo.
> ✅ Com anexo: **"Alterar anexo"** e **"Remover"** (vermelho).
> ✅ Em **RECEITA VÁLIDA ATÉ**, dias passados apagados.
> ✅ _(02/09)_ Com anexo, tocar no **quadrado** amplia a foto (ou abre o PDF no leitor do sistema) —
> quem troca é o link ao lado.

**2.9 — Lembrete.** Popup **"Configurar lembrete"**.

> ✅ Três opções, e **"Nenhum aviso" não existe**.
> ✅ **Alarme** e **Notificação** dividem a primeira linha; **Os dois** ocupa a linha de baixo.
> ✅ A folha tem só a decisão e "Pronto" — o botão **cabe na tela** sem rolar.
> ✅ "Como funcionam os alertas" é um **link** que abre uma tela; o scroll dela desce **e sobe**.
> ✅ Dali, "Ler os Termos" abre os termos, e voltar retorna **à ajuda**.
>
> ⚠️ _Mudou em 02/09._ O acordeão dentro do popup e o retorno "ao popup com a ajuda aberta" não
> existem mais — a explicação virou tela própria (bloco 8-J, aprovado em 08/09).

**2.10 — Prazo × estoque.** `Amoxicilina`, dose 2, 3× de 8/8h desde `06:00`, prazo 7 dias, estoque 20.

> ✅ Avisa que o tratamento consome 42 e você tem 20.

**2.11 — Doses de hoje já passadas.** _(De tarde ou à noite.)_

> ✅ Avisa quais horários de hoje não serão agendados.
> ✅ Pergunta **"VOCÊ JÁ TOMOU ALGUMA DELAS HOJE?"**, nada vem marcado.
> ✅ Marcando uma, diz que ela entra no histórico e que **o estoque não muda**.
> ✅ Salvando, o estoque fica **exatamente** no que você digitou.

---

## SESSÃO 3 — Usar

**3.1 — Lista.** Aba **Remédios**.

> ✅ O card da Insulina mostra `08:00 · 10 UI` e `22:00 · 8 UI`.
> ✅ Rolando, o texto de apoio sobe e **a busca fica fixa**.
> ✅ Busca sem acento funciona (`acido` acha `Ácido`).
> ✅ Ordenação: A–Z, Mais recentes, Acabando.
> ✅ Excluir avisa que o histórico é mantido; o botão físico de voltar fecha o formulário.
> ✅ _(02/09)_ Tocar na **miniatura** de um remédio com foto amplia a imagem.

**3.2 — Home.**

> ✅ Progresso do dia, próxima dose, atrasadas em vermelho.
> ✅ Dose na janela do horário aparece com **É AGORA**; 30 min depois vira **ATRASADA**.
> ✅ "Confirmar todas" lista **os nomes** de cada dose no diálogo.
> ✅ O estoque cai **pela dose**, não 1 por dose.

**3.3 — Estoque.**

> ✅ Ordenação: Acaba primeiro, Menos na caixa, A–Z.
> ✅ A Insulina prevê **16 ou 17 dias** (10 + 8 = 18 UI/dia, não 2 × 10).
> ✅ A Dipirona (gotas com estoque em ml) diz **"Sem previsão de término"**.
> ✅ "Recontar" mostra a diferença antes de confirmar.

**3.4 — Calendário.**

> ✅ Grade do mês azul, com pontinhos nos dias com algo marcado.
> ✅ Rolando, **a grade sobe junto** e só os filtros grudam no topo.
> ✅ Filtros Tudo / Compromissos / Remédios mudam a grade e a lista.
> ✅ Avançando dois meses, as doses **continuam aparecendo** (são projetadas).

**3.5 — Compromissos.** Um futuro (5 dias) e um passado.

> ✅ **DATA** e **HORÁRIO** em **linhas separadas**.
> ✅ Com data no passado, avisa e a seção **LEMBRETES some**.
> ✅ Configurando o lembrete e **depois** voltando a data, avisa que **o lembrete foi descartado**.
> ✅ No card do passado, **"Você foi?"** com Fui / Não fui, e dá para anotar.
> ✅ `0` ou `999` dias dão erro pedindo entre 1 e 180.

---

## SESSÃO 4 — Sair

**4.1** **Conta e dados** → **MEUS DADOS** → **"Apagar meus dados de saúde"**.

> ✅ O diálogo diz o que some e o que fica.
> ✅ A ficha continua intacta; o acesso ao estoque **some** da Home e de Remédios.

**4.2** Desvincule a conta do Google.

> ✅ O diálogo explica o que acontece com a cópia na nuvem.

**4.3** Vincule de novo.

> ✅ Antes de abrir o Google, um diálogo diz que vincular confirma os termos: **Cancelar**, **Ler os
> termos**, **Vincular**.
> ✅ Depois, "Aceito em" mostra a data **de agora**.

**4.4** **"Apagar tudo e recomeçar"** → Continuar → Apagar tudo.

> ✅ Volta para a tela de login; entrando com o Google de novo, o aceite é pedido outra vez.
