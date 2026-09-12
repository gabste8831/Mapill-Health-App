# Roteiro de teste em aparelho

> **Este roteiro tem só o que ainda falta validar.** Os blocos 1 a 9 foram aprovados em 08/09, e a
> maior parte do que restava (10, 11.5.1/2/3/4, 12, 13.2–13.5, 15, 16, 21, 22, 23) passou na rodada
> de 11/09 e saiu daqui.
>
> O histórico completo, incluindo tudo que já foi validado, continua no git.

## O que sobrou, e por quê

| | O que é | Situação |
|---|---|---|
| **13.1** | Tela azul sobre outro app | ✅ Aceito como está (11/09) |
| **14.1.2** | Alarme com o app fora dos recentes | ✅ **Resolvido em 12/09** — era o Autostart da MIUI |
| **18.2** | Alarme sobrevive ao reboot | ✅ **Passou em 12/09** — tocou ao desbloquear |
| **19.2** | Alarme com o app aberto | ✅ **Passou em 12/09** |
| **18.3** | Bateria (8–12h, sem carregador) | Falta rodar — dá para fazer na build atual |
| **19** | Os outros casos de borda | Falta rodar — dá para fazer na build atual |
| **20** | Compromisso e receita | ✅ **Passou em 12/09** — chegaram às 00:01, com o app fechado |
| 🔧 | **Estoque, cartão da Home, tela azul após editar** | **Corrigidos — só a próxima build valida** |
| 🔴 | Alarme adiado toca mesmo após apagar todos os dados | Bug confirmado em 11/09 |
| 🔴 | Responder o alarme abre o app sem desbloquear | Bug confirmado em 12/09 — privacidade |
| **17** | Vários remédios no mesmo horário | Parado — a resposta em lote precisa ser refeita |

### O que a build de 12/09 validou em aparelho

Com o Autostart ligado, e ponta a ponta:

- **Alarme:** app fora dos recentes, celular bloqueado. A tela azul irrompeu e "Tomei" gravou a
  dose. É o caso principal do app, e fecha o 13.1, o 14.1.2 e o 19.2.
- **Notificação:** chegou no modo certo, sem tela cheia, e "Pulei" registrou o desfecho.
- **Compromisso e receita:** as três notificações estavam no celular na manhã seguinte — duas de
  receita e uma de compromisso, entregues às 00:01 com o app fechado. Fecha o bloco 20 para os dois.

> 📌 **O que isso prova além do bloco 20:** o encanamento inteiro funciona com o app fechado a noite
> toda — agendar, sobreviver, e entregar na hora marcada. O estoque que falta não é limitação de
> infraestrutura: é o defeito corrigido em `4cc90e6`, esperando build.

### 🔧 O que só a próxima build valida

Quatro correções entraram **depois** do APK de 12/09. Nada disso adianta testar agora — o binário
instalado ainda tem os defeitos.

| Commit | O que corrige | Como validar |
|---|---|---|
| `a3aa220` | Editar o tratamento impedia a tela azul de voltar | Alarme → editar para notificação → salvar → voltar para alarme. A tela azul tem de subir nas duas vezes |
| `4cc90e6` | O aviso de estoque se matava no reagendamento seguinte | Marcar o aviso, abrir o Diagnóstico: o estoque tem de aparecer entre os agendados **e continuar lá** depois de sair e voltar ao app |
| `4cc90e6` | O cartão da Home exigia antecedência | Marcar o aviso **sem escolher prazo**: o cartão tem de aparecer na semana do fim |
| `358e55c` | O painel de permissões só valia para lembrete de dose | Cadastrar só aviso de estoque ou compromisso, sem alarme de dose, e negar a permissão: o painel tem de aparecer |
| `358e55c` | Autostart não era explicado | `Ajustes → como funcionam os alertas`: tem de haver parágrafo próprio sobre o início automático |
| `930082a` | A tela azul com vários remédios era uma parede de texto | Cadastrar **2 ou 3** no mesmo horário: a lista tem miniatura de 44dp e, ao lado, nome, dose, orientação de tomada e local — tudo legível sem rolar. Depois **4 ou mais**: só a contagem e o botão de abrir o app |

**O que o estoque revelou, e vale para o TCC:** compromisso e receita têm data fixa e nenhuma trava;
o estoque depende de um cálculo e tem a trava que impede repetir aviso a cada dose. Ela era gravada
no **agendamento**, e como reagendar é "cancela tudo e planeja de novo" — a cada volta do app ao
primeiro plano —, o segundo reagendamento comparava a quantidade consigo mesma, concluía que já
avisara e descartava o estoque. O aviso vivia segundos. Agora quem grava é o listener, na entrega.

### O que o 14.1.2 revelou (12/09)

Testado na build `preview` (APK, bundle embutido), num Xiaomi. Duas descobertas, e a ordem importa:

**Sem o Autostart, nada dispara** — nem alarme, nem notificação, nem com o app nos recentes. **Com o
Autostart ligado, funciona.**

A MIUI trata o deslize dos recentes como *force stop* e nasce com o **Autostart desligado** para todo
app instalado. Sem ele, o sistema recusa acordar o processo, e o `AlarmManager` nunca chega a
executar — o agendamento continua registrado e simplesmente não é entregue. Foi o que o Diagnóstico
mostrou em 11/09: o aviso estava agendado e não tocou.

Não é defeito do app, e nenhum código o contorna: o Autostart não tem API pública — não há permissão
a pedir, nem estado a consultar (é por isso que ele não está no painel de permissões, ver
`permissoes-de-alarme.ts`). A mitigação possível é **orientar**, que é o que Alarmy e Sleep as
Android fazem: detectar o fabricante por `Build.MANUFACTURER` e mostrar a instrução específica.

> 📌 **Pendência de implementação:** a tela de ajuda de alertas precisa mencionar o Autostart em
> Xiaomi, Samsung e Motorola. É orientação, não verificação — nunca marcar como "concedido" algo que
> o app não consegue ler. Fica para o refinamento, junto dos outros itens de código.

> 📌 **Para o TCC:** isto é conteúdo, não pendência. Limitação de plataforma documentada, com
> evidência dos dois lados (o Diagnóstico mostrando o aviso agendado + o alarme não tocando) e
> mitigação por orientação. Mostra com precisão a fronteira entre o que o app controla e o que o
> sistema operacional decide.

## A ordem agora

**Com a build atual (12/09):**

1. **19.1, 19.3 e 19.4** — rápidos, cinco a dez minutos cada.
2. **19.4b a 19.7** — numa sessão só, porque mexem no relógio e o 19.7 reinstala o app. Religue o
   Autostart depois do 19.7, ou ele reprova pelo motivo errado.
3. **18.3** — um alarme para daqui a 8–12 h, sem carregador. É o teste da noite: cadastre e durma.

**Com a próxima build:**

5. As cinco validações da tabela 🔧 acima.
6. **20 inteiro**, agora com o estoque.

**Depois, e não antes:**

7. Os dois bugs 🔴 — o de privacidade primeiro, por ser dado de saúde exposto.
8. **17**, quando a resposta em lote for refeita.

> ⚠️ **O Autostart tem de estar ligado em todos os blocos abaixo**, e **reinstalar o app o desliga
> de novo**. Isso afeta o 19 diretamente: o passo 11.7 reinstala o Mapill, então religue o Autostart
> antes de esperar qualquer horário — senão o passo falha pelo motivo errado.

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

---

## 12 — As permissões do alarme ✅ _(passou totalmente em 11/09)_

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
>
> ⚠️ **11/09:** confirmado funcionando dentro do que foi testado até aqui, com o esquema atual da
> notificação. Mas o achado do bloco 14.1.2 (tirar o app dos recentes) ainda não foi cruzado com
> este passo — revisitar se aparecer o mesmo padrão.

---

## 14 — O alarme em tela cheia 🔴🔬

**1.2 — App fora dos recentes** ✅ **passou em 12/09, com o Autostart ligado.**

> ❌ **11/09 e 12/09, Autostart desligado:** nada dispara. Nem alarme, nem notificação — e nem com o
> app **nos** recentes.
> ✅ **12/09, Autostart ligado:** funciona. Tela azul, som em loop, botões.
>
> A causa está detalhada no topo deste arquivo. Resumo: a MIUI nasce com o Autostart desligado e
> recusa acordar o processo, então o `AlarmManager` nunca executa — o aviso fica agendado e não é
> entregue. Não é defeito do app, e não há API para contornar.
>
> Suspeita do Gabriel: efeito da build (dev client). **Confirmar numa build de produção/preview
> antes de tratar como defeito real** — se persistir lá, é o app sendo morto pelo sistema antes de
> disparar o alarme, e vira o assunto do bloco 18/20.

---

## 17 — Vários remédios no mesmo horário

> ⚠️ **Fica por último — precisa ser desenvolvido de novo.** Decisão do Gabriel em 11/09: este bloco
> vai ficar parado até a funcionalidade ser refeita, então não adianta testar em cima do que existe
> hoje.
>
> Contexto anterior (09/09): a resposta em lote tinha saído do escopo — os botões "Tomei todas" e
> "Pulei todas" foram removidos depois de uma sessão caçando um defeito que aparecia ali (duas telas
> do alarme abrindo ao mesmo tempo, corrigido, ver `alarme-em-cena`), porque a resposta em lote não
> valia o risco de manter.

---

## 18 — Sobrevivência a reboot e bateria 🔬

> ✅ **Liberado em 12/09**, com o 14.1.2 resolvido. Rode com o **Autostart ligado** — senão este
> bloco só reconfirma o achado do 14, e não mede o que veio medir.

**Decide se o app precisa de uma tela orientando a desativar a otimização de bateria.**

> 📌 O 14.1.2 já decidiu metade disso: a tela é necessária, e o Autostart entra nela. O que este
> bloco acrescenta é se **reboot** e **economia de bateria** exigem instruções próprias além dele.

**7.1** Cadastre um remédio com **4 horários/dia**, uso contínuo, Alarme. Abra o app, deixe
carregar, feche. _(Isso agenda ~28 avisos.)_

**7.2** 🔬 **Reinicie o celular.** **Não abra o app** e espere o próximo horário.

> ❌ **12/09: reprovou.** Remédio com quatro horários, o primeiro para 3 min. Salvou, reiniciou o
> celular, não abriu o app nem desbloqueou. O horário chegou e **nada tocou**.
>
> O que **não** é a causa: os receptores de boot. O `plugins/alarme-em-tela-cheia.js` já os
> reexporta com `exported="true"`, que é a correção conhecida para o Android 12+ (sem ela o sistema
> nunca os invoca, e foi o defeito visto em 05/09). O plugin roda no prebuild desta build.
>
> **Suspeita principal: o Autostart, de novo.** A MIUI bloqueia `BOOT_COMPLETED` para app sem
> Autostart — é o caso que ela controla mais de perto, porque é exatamente o que enche a inicialização
> do aparelho. Se for isso, o app está correto e a limitação é a mesma do 14.1.2.
>
> ✅ **Resolvido no mesmo teste: ao desbloquear o celular, o alarme tocou.**
>
> Isto fecha o diagnóstico, e a favor do app: **o agendamento sobreviveu ao reboot**. O que ficou
> retido foi a *entrega*, enquanto o processo não podia rodar — e ela saiu no instante em que o
> desbloqueio liberou o app.
>
> A distinção importa e é o que absolve o código: o alarme tocou **ao desbloquear**, e não "no
> próximo horário, depois de abrir o app". Se o reboot tivesse apagado o agendamento, nada tocaria —
> nem antes, nem depois. O `AlarmManager` disparou no horário certo e o Android guardou a entrega.
>
> Mesmo padrão do 14.1.2: a MIUI segurando o processo. Os receptores de boot do plugin fizeram a
> parte deles.

> 📌 **Para o TCC:** este é o par do achado do 14.1.2, e junto com ele forma um argumento completo. O
> app agenda corretamente (provado: sobrevive ao reboot), e a entrega depende de o fabricante
> autorizar o processo a acordar — o que é decisão do sistema, não do aplicativo. A evidência aqui é
> ainda mais limpa que a do Diagnóstico: o alarme tocou no desbloqueio, ou seja, existia, estava
> correto, e só esperava permissão para se apresentar.

**7.3** 🔬 **O mais chato:** deixe um remédio agendado para **daqui a 8–12 h** (a noite serve),
celular **sem carregador**, app fechado, economia de bateria do fabricante ativa.

🔬 **Anote:** chegou? No horário ou atrasado? _(Xiaomi, Samsung e Motorola são os mais agressivos.)_

---

## 19 — Os casos de borda do alarme 🔬 (C1.8)

> ✅ **Liberado em 12/09**, com o 14.1.2 resolvido.
>
> ⚠️ **O passo 11.7 reinstala o app, e isso desliga o Autostart.** Religue antes de esperar o
> horário, ou o passo reprova pelo motivo errado — e é justamente o passo que mede o pior modo de
> falhar do app.

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

> ✅ **Liberado em 12/09**, com o 14.1.2 resolvido. Este bloco depende de notificação sobrevivendo
> com o app fechado, então o **Autostart precisa estar ligado** — era ele que derrubava tudo.

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

## 🔴 Achado de 12/09 — responder o alarme dá acesso ao app sem desbloquear o celular

Tela bloqueada, o alarme toca, a tela azul sobe. Ao tocar em **Tomei**, o app abre na Home — **sem
pedir o desbloqueio**. O celular continua tecnicamente bloqueado, mas o Mapill está acessível.

> ❌ **É falha de privacidade, e num app de saúde ela é séria.** Qualquer pessoa com o aparelho na
> mão pode esperar (ou disparar) um alarme, tocar em "Tomei", e chegar aos medicamentos, ao
> histórico de doses e à ficha de saúde — alergias, tipo sanguíneo, contatos de emergência. Sem
> senha, sem digital.
>
> **A causa** está em `plugins/alarme-em-tela-cheia.js`: o `showWhenLocked="true"` é aplicado à
> **MainActivity**, isto é, ao app inteiro, e não a uma Activity exclusiva do alarme. O
> `fullScreenAction` do Notifee monta o componente dentro da própria MainActivity (ver `index.js`),
> então não havia onde mais colocá-lo. Quando a tela do alarme fecha, quem está atrás é o app — que
> herdou a mesma permissão de aparecer sobre o bloqueio.
>
> **O comportamento correto** é o do despertador nativo: a tela do alarme aparece sobre o bloqueio,
> a pessoa responde, e o bloqueio **volta**. Entrar no app exige desbloquear.
>
> **Duas saídas, nenhuma trivial:**
> 1. Uma Activity nativa própria para o alarme, com `showWhenLocked` só nela. É a correção certa, e
>    é código nativo.
> 2. O app recusar a navegação enquanto o aparelho estiver bloqueado, lendo
>    `KeyguardManager.isKeyguardLocked()`. Mais viável em JS, mas ainda exige um módulo nativo
>    pequeno — não há API do Expo que exponha esse estado.
>
> **Não bloqueia os testes:** os blocos 18, 19 e 20 rodam normalmente. Mas isto é privacidade de
> dado de saúde, não polimento — decidir antes da defesa se entra.

> 📌 **Para o TCC:** cabe na seção 4.7 (Privacidade e LGPD). É um caso em que a funcionalidade
> exigida pelo domínio (o alarme tem de irromper sobre o bloqueio, senão não é alarme) entra em
> tensão direta com a minimização de exposição do dado sensível — e a resolução dessa tensão é
> decisão de projeto, não detalhe de implementação.

---

## 🔴 Achado de 11/09 — alarme adiado sobrevive ao apagamento total dos dados

Cadastro com alarme, deixado tocar, adiado 5 min. **Antes dos 5 min vencerem**, o Gabriel apagou
todos os dados de saúde. O alarme **tocou mesmo assim**, no fim dos 5 minutos.

> ❌ O adiamento é agendado direto no sistema (Notifee), fora da grade normal — o mesmo padrão do
> risco já anotado no antigo 15.6 (`cancelarTudo` e o prefixo `alarme:adiado-…`). Apagar os dados
> precisa cancelar também os adiamentos pendentes, não só a grade principal.
>
> **Resolver antes da próxima rodada.**

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
