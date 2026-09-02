# Roteiro de teste em aparelho

> **Este é o único roteiro de teste do projeto.** Ele tem duas partes, e a ordem importa:
>
> | | O que é | Quando | Tempo |
> |---|---|---|---|
> | **[Parte 1 — Integridade](#parte-1--integridade)** | O que pode estar **quebrado** | **Primeiro** | ~1 h |
> | **[Parte 2 — Passada geral](#parte-2--passada-geral)** | O app inteiro, do zero, como quem nunca o abriu | Antes da defesa | ~2 h |
>
> A Parte 1 não cobre o app todo de propósito: cobre o que tem chance real de estar quebrado.
>
> **Rodada de 02/09.** Duas coisas mudaram desde a última execução, e são as duas primeiras a
> testar:
>
> - O **alarme virou tela cheia** com som contínuo (blocos 0 e 1). Até aqui ele era uma notificação
>   de alta prioridade, que toca uma vez e para — o que não é um despertador.
> - As **permissões viraram um painel só** (bloco 0), com as quatro que o alarme precisa. Duas delas
>   nunca tinham sido pedidas, e são justamente as causas de "o aviso não chegou" que ninguém
>   diagnostica sozinho: alarme exato e economia de bateria.
>
> **O caminho feliz do alarme já passou em 01/09** — tela cheia por cima do bloqueio, som em loop,
> com o app fechado. O que **não** passou, e é o motivo do bloco novo, são os casos em que o alarme
> pode **mentir**: o [bloco 11](#11--os-casos-de-borda-do-alarme--c18) reúne os nove casos de borda
> do C1.8 e é o que fecha o bloco C1 formalmente no plano.
>
> Há também um **[bloco 12](#12--o-relatório-em-pdf-d4)**: o relatório em PDF, escrito em 02/09 e
> nunca aberto num aparelho.
>
> ### 🔧 A fundação dos avisos mudou (02/09)
>
> **Todo o agendamento passou para o Notifee.** Antes eram duas bibliotecas — Notifee para o alarme
> de tela cheia, `expo-notifications` para lembretes, compromissos e receitas. Agora é uma só, e o
> motivo é o alarme órfão: com duas listas separadas, "cancelar tudo" dependia de lembrar de chamar
> as duas. Detalhe em [C1.10](./PLANO-DE-DESENVOLVIMENTO.md).
>
> **O que isso significa para esta rodada:** o modo **Notificação** trocou de biblioteca por
> inteiro, então o que passou em 01/09 **não vale mais como validado**. Os blocos 2, 3 e 4 voltam a
> ser obrigatórios, mesmo tendo passado antes.
>
> Um ganho a conferir de propósito: o botão "Tomei" agora grava **com o app fechado**, sem depender
> de a pessoa abrir o app depois. Antes a escrita só acontecia na abertura seguinte.
>
> ### 🎨 E o passe de design (02/09)
>
> Dez frentes mexeram em **coisa transversal** — feedback de toque, teclado, tipografia, cor,
> espaçamento. Isso significa que **qualquer tela pode ter regredido**, não só as que foram tocadas
> de propósito.
>
> O [bloco 12.9](#129--o-passe-de-design-0209) cobre o que mudou, item a item. O
> [bloco 14](#14--regressão-todas-as-telas) percorre o app inteiro procurando o que quebrou sem
> ninguém pedir.
>
> ---
>
> ### Ordem sugerida desta rodada
>
> **12.9 → 2 → 3 → 4 → 5 → 12 → 7 → 13 → 14 → 11**
>
> | Bloco | Por que nesta posição |
> |---|---|
> | **12.9** | Primeiro: é o que acabou de mudar, e é a única build que ninguém viu ainda |
> | **2, 3, 4** | A troca de biblioteca invalidou o que passou em 01/09 |
> | **5, 12** | Nunca rodaram |
> | **7** | Precisa de tempo real correndo (reboot, bateria) |
> | **13** | TalkBack e fonte ampliada — depois que o visual estiver conferido |
> | **14** | A varredura de regressão, com o olho já calibrado pelos anteriores |
> | **11** | **Por último**: mexe no relógio e reinstala o app, e depois dele o estado do aparelho não serve para mais nada |

## Como reportar

Só o que falhar, com o número do passo:

```
2.3 falhou — a notificação não chegou com o app fechado
5.2 falhou — o aviso do remédio excluído chegou mesmo assim
resto ok
```

- 🔬 marca as perguntas que **só o aparelho responde**. Anote a resposta **mesmo quando passar** —
  são elas que fecham o C1 formalmente no plano.
- Se um passo falhar, os seguintes do mesmo bloco costumam depender dele. Avise e siga para o
  próximo bloco.

## Antes de começar

⚠️ **Build nova, e desinstale a anterior.** Quatro motivos que se somam:

1. Permissões novas no `app.json` (`USE_FULL_SCREEN_INTENT`, `ACCESS_NOTIFICATION_POLICY`), e
   permissão não entra por recarga do Metro.
2. **Notifee** é dependência nativa — é ele que abre o alarme em tela cheia.
3. Os canais subiram para **`v5`** (02/09, com a troca de biblioteca). Um canal já criado fica
   **congelado** no aparelho: som e importância não mudam por atualização. Instalar por cima
   manteria o alarme mudo.
4. `expo-camera` é dependência nativa (bloco 8).

⚠️ **Aparelho físico.** Emulador não serve para os blocos 1, 2 e 3 — o que está em jogo é o
comportamento do sistema com o app fechado e sob economia de bateria.

```bash
npx expo start --dev-client
```

**Confirme em 10 segundos que é a build certa:** abra o app com um remédio já cadastrado com
lembrete. Deve aparecer o **painel de permissões** na Home, listando o que falta autorizar. Se não
aparecer nada e o alarme não tocar, a build é antiga.

---
---

# PARTE 1 — Integridade

## 0 — As permissões 🔴

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

## 1 — O alarme em tela cheia 🔴🔬

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

## 2 — Os botões da notificação

Aqui estavam dois defeitos de 29/08: cinco toques em "Adiar" geravam **cinco** lembretes, e o
estoque descontava 1 em vez da dose.

⚠️ **Use lembrete `Notificação` neste bloco inteiro.** Os botões de ação vivem na notificação, e o
modo `Alarme` agora abre a tela cheia em vez de mostrar uma — o que ele faz está no bloco 1.

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
> ❌ Se a dose só aparecer confirmada *depois* de abrir o app, o handler de segundo plano não está
> registrado. É o que o `index.js` faz antes de o roteador subir.

**2.6 — O adiado sobrevive ao reagendamento.** Cadastre um para daqui a 3 min. Quando chegar, toque
em **Adiar 5 min**. Em seguida **abra o app** (o que dispara um reagendamento completo) e feche.

> ✅ 🔴 O aviso adiado **ainda chega**, ~5 min depois do toque.
> ❌ Se não chegar, o `cancelarTudo` o apagou junto com a grade — era exatamente o defeito que a
> migração introduziria se o filtro de id olhasse só o prefixo `adiado-`, já que o adiado é agendado
> como alarme e seu id fica `alarme:adiado-…`.

---

## 3 — Nada de alarme órfão

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

## 4 — Vários remédios no mesmo horário

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

## 5 — Sincronização com a nuvem 🔬 (D1)

**O bloco mais novo e o que nunca rodou.** Precisa de **conta Google vinculada**.

**5.1** Ao abrir a build nova, o app **pede o aceite dos termos de novo**.

> ✅ Porque a versão subiu para **1.2.0**, descrevendo a cópia na nuvem.
> ✅ Nos termos, "Onde seus dados ficam armazenados" diz que **fotos e receita continuam só no
> aparelho**.
> ❌ Se não pedir, o bump não pegou.

**5.2** **Ajustes** → **Conta e dados**, abaixo da linha da conta.

> ✅ Existe o bloco de sincronização: **"Tudo salvo na nuvem"** ou **"N alterações para enviar"**.
> ✅ **Sem** conta vinculada, esse bloco **não aparece**.

**5.3** **Modo avião ligado**, cadastre um remédio.

> ✅ O cadastro funciona **normalmente** — nada trava nem reclama de internet.
> ✅ O bloco diz **"1 alteração para enviar"**.

**5.4** Desligue o modo avião, saia do app e volte.

> ✅ Volta para **"Tudo salvo na nuvem"** sozinho.

**5.5** 🔬 **O teste que importa:** desinstale o app, instale de novo, entre **com a mesma conta**.

> ✅ Remédios, tratamentos, histórico e compromissos **voltam**.
> ✅ As **fotos não voltam** — esperado, anexos não sobem.

🔬 **Anote:** quanto tempo até os dados aparecerem?

---

## 6 — Exportar e apagar 🔬 (D3)

⚠️ **Faça por último — o 6.2 apaga tudo.**

**6.1** **Ajustes** → **Conta e dados** → **MEUS DADOS** → **"Baixar uma cópia dos meus dados"**.

> ✅ Abre o compartilhamento do Android. Salve e abra o arquivo.
> ✅ É um JSON legível, com seções em português, e **seus dados estão lá**.

**6.2** 🔬 **Com a conta vinculada**, **"Apagar meus dados de saúde"** → confirme.

> ✅ Os remédios somem.
> ✅ 🔬 **O que importa:** feche o app, abra e espere sincronizar. Eles **não voltam**.
> ❌ Se voltarem, o apagamento na nuvem falhou — avise.

---

## 7 — Sobrevivência 🔬

**Decide se o app precisa de uma tela orientando a desativar a otimização de bateria.**

**7.1** Cadastre um remédio com **4 horários/dia**, uso contínuo, Alarme. Abra o app, deixe
carregar, feche. *(Isso agenda ~28 avisos.)*

**7.2** 🔬 **Reinicie o celular.** **Não abra o app** e espere o próximo horário.

> ✅ A notificação chega mesmo depois do reboot, sem o app ter sido aberto.
> ❌ Se não chegar, dependemos do app ser aberto após cada reboot — anote.

**7.3** 🔬 **O mais chato:** deixe um remédio agendado para **daqui a 8–12 h** (a noite serve),
celular **sem carregador**, app fechado, economia de bateria do fabricante ativa.

🔬 **Anote:** chegou? No horário ou atrasado? *(Xiaomi, Samsung e Motorola são os mais agressivos.)*

---

## 8 — Câmera e base de medicamentos (B1, B3)

**8.1** **Remédios** → **+** → **Cadastro manual**. No nome, digite `dipi`.

> ✅ Aparece **"Encontrados na base da Anvisa"** com sugestões.
> ⏳ Na **primeira abertura** do app pode demorar: a base (7 mil itens) é importada em segundo
> plano. Feche e abra o cadastro de novo.

**8.2** Toque numa sugestão.

> ✅ Nome preenchido **com a dosagem**; **princípio ativo** preenchido em INFORMAÇÕES ADICIONAIS.
> ✅ **Forma, dose e horários continuam vazios** — a base não adivinha posologia.

**8.3** **Remédios** → **+** → **Escanear código de barras**.

> ✅ Pede permissão de câmera explicando que **nenhuma foto é tirada ou guardada**.
> ✅ Recusando, aparece **"Cadastrar sem escanear"** — não é beco sem saída.

**8.4** Aponte para a caixa de um remédio comum.

> ✅ Mostra o remédio encontrado; **"Continuar o cadastro"** abre o formulário preenchido.

**8.5** Escaneie um código **que não seja de remédio** (um pacote de bolacha).

> ✅ Diz **"Código não encontrado"**, mostra o número lido, e oferece **"Cadastrar à mão"** e
> **"Ler outro código"**. Não trava nem volta sozinho.

---

## 9 — O que mudou no visual (30 e 31/08)

**Passe de design e varredura de acessibilidade.** Nada disso rodou em aparelho, e são justamente
as duas coisas que **só se validam vendo**.

**9.1** Percorra **Home**, **Remédios**, **Estoque**, **Calendário** e **Minha adesão**.

> ✅ Os cartões têm **canto arredondado e sombra suave** — nenhum tem borda cinza de 1px.
> ✅ Nenhuma lista parece **planilha**.
> ✅ Na Home, o cartão da dose **não é mais um retângulo de canto reto**.

**9.2** Olhe uma dose **"É AGORA"** e uma **"ATRASADA"** na Home.

> ✅ Cada uma tem uma **faixa colorida à esquerda** (verde e vermelha), não um contorno em volta.
> ✅ O fundo é um tom **suave** — o verde não "berra".

**9.3** 🔬 **Configurações do Android** → Tela → **Tamanho da fonte** → aumente para o **máximo**.
Volte ao app.

> ✅ 🔬 **O texto dos botões não é cortado** — nem "Confirmar", nem os botões de formulário.
> ✅ 🔬 Os campos de texto crescem junto com a letra, sem recortar o que foi digitado.
> ❌ Qualquer texto cortado: anote em qual tela e qual botão.
>
> *(Era o defeito mais grave da varredura: `height` travado recortava o rótulo de todo botão do app.
> Devolva a fonte ao normal depois.)*

**9.4** Toque nos botões de **excluir** na lista de remédios e no calendário, e no **×** de uma
alergia na ficha.

> ✅ Dá para acertar **sem esforço**, mesmo com o dedo. Nenhum alvo minúsculo.

**9.5** 🔬 **Opcional, se der tempo:** ative o **TalkBack** e toque numa dose da Home.

> ✅ 🔬 Ele lê a linha como **uma frase só**, na ordem: *"Dipirona, 08:00, atrasada. 1 comprimido"*.
> ✅ 🔬 Os botões **Confirmar** e **Pular** continuam sendo lidos separadamente.
> ❌ Se ele parar quatro vezes na mesma linha, ou ler o estado antes do nome, anote.

---

## 10 — Os menores (C2, C3, D2, B5)

Blocos pequenos que nunca rodaram. Um passo cada.

**10.1 — Permissão revogada (Home).** Com tudo concedido (bloco 0), **desligue as notificações** do
Mapill nas configurações do Android e volte à Home.

> ✅ 🔴 O painel de permissões **reaparece**, agora em **vermelho**, dizendo que o alarme **não vai
> tocar** — porque falta uma obrigatória.
> ✅ 🔴 Religando a permissão e voltando, ele **some sozinho**, sem reabrir o app.
> ✅ 🔴 Excluindo **todos** os remédios com lembrete, o painel **não aparece** — sem tratamento
> esperando aviso, não há o que cobrar.

**10.2 — "Ignorar por agora" (C2).** Abra a tela do horário de uma dose.

> ✅ Abaixo de Tomei e Pulei existe **"Ignorar por agora"**, em texto simples.
> ✅ Tocando: aviso azul **"A dose continua pendente"**, e o botão **some**.
> ✅ Na Home ela continua **pendente**; em Minha adesão conta como **"sem resposta"**, não "pulada".

**10.3 — Relatório de adesão (D2).** Home → card **"Acompanhamento semanal"**.

> ✅ Abre **"Minha adesão"** com a porcentagem e "X de Y doses tomadas".
> ✅ **Doses de hoje que ainda não venceram NÃO entram na conta** — se você tem uma dose às 22h e
> são 15h, ela não pode estar contando contra você.
> ✅ **Puladas** e **sem resposta** são números **separados**.
> ✅ "Por medicamento" ordenado do **pior para o melhor**.
> ✅ Sem dose vencida, diz **"Ainda não há o que medir"** — nunca "0%".

**10.4 — Compromissos (C3).** Calendário → **+** → compromisso para **amanhã**, com lembrete.

> ✅ O texto diz que os avisos chegam **às 8 da manhã**.
> ❌ Se disser que os lembretes "ainda estão sendo desenvolvidos", o texto é antigo.
> ✅ **Excluindo o compromisso**, o aviso dele **não chega**. *(Órfão, agora para compromisso.)*

**10.5 — Recontagem (B5).** Remédios → **Gerenciar estoques**.

> ✅ Com estoque recém-cadastrado, o bloco amarelo **não aparece** — ele só surge após **30 dias**
> sem conferência. Provavelmente não dá para ver agora, e tudo bem.

---

## 11 — Os casos de borda do alarme 🔬 (C1.8)

**É o bloco que fecha o C1 no plano.** Os blocos 1 a 4 provam que o alarme funciona quando tudo
está normal; este prova que ele não **mente** quando não está. Num app de medicação, os dois modos
de falhar são opostos e igualmente graves: o aviso que **não chega**, e o aviso que chega **errado**
— na hora errada, duplicado, ou de um remédio que a pessoa já tomou.

Cada passo tem um número de C1.8 ao lado. Anote a resposta **mesmo quando passar**: são elas que
marcam as caixas do plano.

⚠️ **Este bloco mexe no relógio do aparelho e reinstala o app.** Faça-o **por último** na Parte 1 —
depois dele o estado do aparelho não serve para os outros blocos.

---

**11.1 — Dose já confirmada não toca** *(C1.8 nº6)*

Cadastre `Tomei Antes`, daqui a 4 min, **Alarme**. Abra a Home e **confirme a dose pela Home**,
antes do horário. Feche o app e espere passar o horário.

> ✅ 🔴 **Nada toca.** Nem tela cheia, nem notificação.
> ❌ Se tocar, o cancelamento individual não alcançou o Notifee — é o mesmo risco do bloco 3, e o
> mais provável de escapar, porque aqui quem cancela é a Home e não a edição do cadastro.

---

**11.2 — Alarme com o app já aberto na tela da dose** *(C1.8 nº5)*

Cadastre `App Aberto`, daqui a 3 min, **Alarme**. **Deixe o app aberto**, e navegue até a tela do
horário dessa mesma dose. Espere o horário.

> ✅ 🔴 A tela de alarme aparece **mesmo com o app aberto** *(é o que o commit de 02/09 entregou)*.
> ✅ 🔴 **Não empilha duas telas** — ao sair do alarme você não encontra outra tela de dose por baixo
> esperando resposta da mesma dose.
> ✅ Respondendo **Tomei** no alarme, a tela por baixo reflete a resposta, e não continua oferecendo
> Tomei/Pulei para uma dose já resolvida.

🔬 **Anote:** aconteceu de responder duas vezes a mesma dose?

---

**11.3 — Dose atravessando a meia-noite** *(C1.8 nº2)*

Cadastre `Meia Noite` com **dois horários**: `23:50` e `00:10`. Uso contínuo, Alarme.

> ✅ Os dois horários são aceitos e aparecem no resumo do cadastro.
> ✅ 🔴 Na Home, a dose das `00:10` aparece **no dia seguinte**, não hoje.

Se der para esperar a virada, espere. Se não, ajuste os horários para daqui a 3 e 8 min e confirme
que os dois tocam — o que este passo testa de verdade é a geração, e ela já foi verificada em Node
contra a virada de dia.

🔬 **Anote:** a dose de `00:10` foi listada no dia certo?

---

**11.4 — Não perturbe / Foco** *(C1.8 nº4)*

Cadastre `Silencioso`, daqui a 3 min, **Alarme**. Ative o **Não perturbe** do Android. Feche o app e
bloqueie.

> ✅ 🔴 **O alarme toca mesmo assim** — é o que `bypassDnd` e a permissão de política de notificação
> existem para garantir *(commit `5747ed9`)*.
> ❌ Se ficar mudo, anote: é a diferença entre o app cumprir ou não a promessa "toca alto, mesmo no
> silencioso" — e, pela RN15, o **texto da interface teria que mudar**, não a promessa ficar.

Repita com o celular no **silencioso** (não o Não perturbe — o botão de volume no mudo).

> ✅ 🔴 Toca igual.

🔬 **Anote os dois casos separadamente.** Eles falham por motivos diferentes.

---

**11.5 — Relógio do aparelho mudado à mão** *(C1.8 nº3)*

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

**11.6 — Fuso horário** *(C1.8 nº1)*

Com a hora automática **desligada**, mude o **fuso** para um vizinho (ex.: Fortaleza / Manaus). Abra
o app.

> ✅ 🔴 A dose das 08:00 **continua às 08:00** na Home — o horário é uma promessa sobre o relógio de
> parede da pessoa, não um instante absoluto. Quem toma remédio às 8 da manhã toma às 8 da manhã em
> qualquer lugar.
> ❌ Se a dose escorregar para 07:00 ou 09:00, anote — é o defeito mais sutil deste bloco.

**Devolva o fuso** ao terminar.

🔬 **Anote:** o horário escorregou?

---

**11.7 — App reinstalado** *(C1.8 nº9)*

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
depois de conferir que o bloco 5 (sincronização) já restaurou.

🔬 **Anote:** voltaram após a primeira abertura?

---

**11.8 — Bateria crítica** *(C1.8 nº8)*

Não force. **Se em algum momento da semana o celular chegar abaixo de 15% com a economia extrema
ligada** e houver dose agendada, anote se o aviso chegou.

🔬 **Anote se acontecer naturalmente.** Não vale gastar uma sessão descarregando o aparelho de
propósito.

---

**Fecha o quê:** os nove casos do C1.8. Com 11.1 a 11.7 anotados, a caixa *"Checklist de borda
percorrido"* do plano fecha — 11.8 é oportunista e pode ficar como "não observado".

---

## 12 — O relatório em PDF (D4)

**Escrito em 02/09, nunca aberto num aparelho.** O conteúdo já foi verificado em Node (28
verificações em `scripts/conferir-relatorio.mjs`), então o que este bloco testa não é a conta — é o
**documento**: se ele abre, se o texto não corta, e se dá para tirar do celular.

⚠️ Faça-o **antes** do bloco 11, que mexe no relógio e reinstala o app.

**12.1** Home → card **Acompanhamento semanal** → **Minha adesão**. Escolha **30 dias** e toque em
**Gerar relatório em PDF**.

> ✅ O botão mostra carregando e a folha de compartilhamento do sistema aparece.
> ✅ Dá para **salvar** o arquivo e **enviar** por outro aplicativo.

**12.2** Abra o PDF salvo.

> ✅ Abre num leitor de PDF comum, sem erro.
> ✅ **Cabeçalho** com o seu nome, o período (`03/08/2026 a 02/09/2026`) e a data de emissão.
> ✅ **Tratamentos em curso** com dose, frequência e horários — os mesmos textos da aba Remédios.
> ✅ **Adesão** com a porcentagem e a tabela por medicamento.
> ✅ **Doses não tomadas** aparecem **contadas** ("Metformina — 4 · 2"), e **não** uma linha por
> dose perdida.
> ❌ Se vier uma lista longa de doses, uma por linha, o agrupamento não está sendo aplicado.

**12.3** Confira se o número do papel bate com o da tela.

> ✅ 🔴 A porcentagem do PDF é **idêntica** à que a tela mostra para o mesmo período. Se divergirem,
> o relatório e a tela estão lendo coisas diferentes — e o papel é o que vai para o médico.

**12.4** Cadastre um remédio com **`&` ou `<` no nome** — por exemplo `Vitamina A & D <teste>`.
Gere o relatório de novo.

> ✅ 🔴 O nome aparece **inteiro e correto** no PDF.
> ❌ Se o documento vier **truncado** a partir dali, ou o nome sair pela metade, o escape falhou —
> é o defeito que não dá erro nenhum e some com uma linha de tratamento.

**12.5 — O filtro por medicamento.** Com **três ou mais** remédios cadastrados, toque na linha
**MEDICAMENTOS NO RELATÓRIO**.

> ✅ Diz **"Todos"** antes de você mexer, e todos aparecem **marcados** no popup.
> ✅ Desmarcando um, a linha passa a dizer **"2 de 3"** (e não "1 de 3" — desmarcar um deixa os
> outros dois, não deixa só o que você tocou).
> ✅ Desmarcando um, sobra o nome do último: a linha mostra **o nome dele**, não "1 de 3".
> ✅ 🔴 **Desmarcando todos, volta sozinho para "Todos"** — o app não deixa você gerar um relatório
> sem tratamento nenhum.
> ✅ Remarcando tudo à mão, volta a dizer **"Todos"**.

Gere o relatório com **um** medicamento desmarcado.

> ✅ 🔴 O PDF traz, logo abaixo do cabeçalho, **"Este relatório cobre 2 de 3 tratamentos — não o
> tratamento completo do paciente"**.
> ✅ O medicamento desmarcado **não aparece** em nenhuma seção.
> ✅ Gerando de novo com **"Todos"**, esse aviso **some** do documento.

**12.6** Com o app **recém-instalado** (ou com todas as doses ainda por vencer), gere o relatório.

> ✅ Diz **"ainda não há o que medir"**, e em lugar nenhum aparece **0%**. *(RN20: zero por cento é
> uma afirmação sobre o paciente; ausência de dados não é.)*

**12.7** 🔬 **Se tiver acesso a uma impressora**, imprima em **preto e branco**.

🔬 **Anote:** ficou legível? Alguma seção depende de cor para ser entendida?

**12.8** **Modo avião ligado**, gere o relatório.

> ✅ Gera normalmente — nenhum dado sai do aparelho para o PDF existir.

---

## 12.9 — O passe de design (02/09)

**Dez frentes mexeram em coisa transversal** — toque, teclado, tipografia, cor. Este bloco cobre o
que mudou; a regressão de todas as telas vem depois, no bloco 14.

**A. O toque responde.** Percorra Home, Remédios, Estoque e Cadastro tocando em botões, chips,
ícones e linhas.

> ✅ 🔴 **Tudo** o que é tocável escurece e/ou encolhe ao toque. Antes nada respondia.
> ✅ Nada treme: linhas de largura total (checkbox, acordeão) só escurecem, não encolhem.

**B. O teclado sai.** Em Ficha, Cadastro de medicamento e Cadastro de compromisso:

> ✅ 🔴 **Tocar em área vazia** fecha o teclado — era o gesto que faltava.
> ✅ **Enter** fecha (menos em campo de observação, onde ele quebra linha).
> ✅ Arrastar a lista fecha.
> ✅ Tocar direto num botão com o teclado aberto: o botão responde no **primeiro** toque.

**C. O rodapé não cola.** No cadastro, com o teclado aberto:

> ✅ 🔴 O botão de salvar **sai de cena** em vez de ficar espremido na borda do teclado.
> ✅ Fechando o teclado (toque em área vazia), ele volta.
> ⚠️ No **popup** de horário é o oposto e está certo: ali o botão continua à vista.

**D. O relógio.** Campo de horário → toque no ícone de relógio.

> ✅ 🔴 Abre o **mostrador redondo nativo** do Android, e não os dois campos digitáveis.
> ✅ Digitar pelo teclado no campo continua funcionando.
> ✅ As cores do popup são as do Mapill — **não** o verde/roxo do tema do sistema.
> ✅ Escolher **20:00** grava 20:00 (formato 24h, sem AM/PM).

**E. As sugestões da CMED.** No cadastro, digite `dipi`.

> ✅ 🔴 Nomes em **"Dipirona Sódica"**, não `DIPIRONA SÓDICA`.
> ✅ **4 sugestões**, não 6 — e a lista não cobre o campo que está sendo digitado.
> ✅ Nome longo corta com reticências em vez de quebrar em três linhas.
> ✅ Buscar `aas`: a sigla continua **AAS** em caixa alta.
> ✅ 🔴 **Escolhendo** uma sugestão, o nome que vai para o campo também está capitalizado.

**F. A foto no alarme.** Cadastre um remédio **com foto** da caixa e alarme para +3 min.

> ✅ 🔴 A foto aparece na tela do alarme, larga, acima do nome.
> ✅ Um remédio **sem** foto não deixa espaço vazio nem quebra o layout.

**G. Cor e espaçamento.**

> ✅ **Home**: os blocos têm mais respiro entre si.
> ✅ **Remédios**: remédio sem foto mostra um quadrado azul claro com ícone — e a lista fica
> alinhada, com e sem foto.
> ✅ **Remédios**: os ícones de editar/excluir têm **fundo** e parecem botões.
> ✅ **Busca**: ao tocar, ganha anel azul e a lupa fica azul.
> ✅ **Adesão**: o número grande está num bloco azul.
> ✅ **Estoque**: "Repor" tem fundo azul claro, diferente de "Recontar".

**H. A foto que ficava branca** 🔴🔬 — **o único item do passe que só o aparelho pode dar como
resolvido.**

O defeito: escolher a foto, confirmar, e a miniatura ficar branca — aparecendo só depois de sair e
voltar da tela. A causa conhecida já tinha sido corrigida antes e o defeito continuou, então a
correção de agora cobre as **duas** hipóteses restantes sem conseguir distinguir qual era.

Ficha de saúde → **adicionar foto pela galeria**.

> ✅ 🔴 A miniatura aparece **na hora**, sem precisar sair e voltar.

Repita pela **câmera**. Depois repita na **foto da caixa** de um medicamento. E por fim **troque**
uma foto já existente.

> ✅ Em todos, a foto nova aparece imediatamente e a antiga não volta.

🔬 **Se ainda falhar, anote duas coisas** — elas dizem qual das hipóteses é a certa, e sem isso a
próxima correção seria chute:
> 1. A foto era grande? (foto de câmera é maior que de galeria)
> 2. Ela aparece sozinha depois de alguns segundos parado na tela, ou só ao sair e voltar?

---

## 13 — Acessibilidade com o TalkBack 🔬 (E1)

**Fecha o último item do E1.** A varredura por código (02/09) corrigiu sete defeitos, mas leitor de
tela não se valida lendo código — só ouvindo. São poucos passos, e cobrem os fluxos onde errar tem
consequência clínica.

⚠️ **Ligue o TalkBack** em Configurações → Acessibilidade. Para desligar rápido, segure os dois
botões de volume por três segundos.

⚠️ **Ligue também a fonte ampliada** (Configurações → Tela → Tamanho da fonte, no máximo). Metade
dos defeitos corrigidos só aparece assim.

---

**13.1 — A agenda da Home.** Deslize pelos itens de dose.

> ✅ 🔴 Cada dose é lida como **uma frase só**: "Dipirona, 08:00, atrasada" — e **não** em quatro
> paradas soltas.
> ✅ 🔴 O nome do remédio vem **antes** do estado.
> ✅ 🔴 "Confirmar" e "Pular" são alcançáveis e **não se tocam por engano** — foram de 32 para 44pt.
> ✅ Com a fonte no máximo, o rótulo dos dois botões **não corta**.

**13.2 — A tela do horário** (a que a notificação abre). Abra uma dose e responda **Tomei**.

> ✅ 🔴 O cartão é lido como uma frase, terminando em "aguardando resposta".
> ✅ 🔴 Depois de responder, o botão "Tomei" é anunciado como **selecionado** — antes os dois soavam
> idênticos, e a única diferença era a cor.
> ✅ O selo "Tomada" é lido junto do cartão.

**13.3 — O calendário.** Vá a um dia com dose já resolvida.

> ✅ 🔴 A linha diz **"dose tomada"** ou **"dose não tomada"** — antes o desfecho vinha só de um
> ícone, que o leitor não anuncia.

**13.4 — O cadastro de medicamento.** Escolha "Dias da semana".

> ✅ Cada dia é lido por extenso ("segunda-feira"), não como "Seg".
> ✅ São anunciados como **marcado/desmarcado**, não como botão.

Agora abra os horários e **repita um horário de propósito**.

> ✅ 🔴 A ficha do horário repetido é lida como **"08:00, horário repetido"** — o fundo vermelho
> sozinho não diz qual dos horários é o problema.

Volte e percorra as linhas de **estoque** e **lembrete**.

> ✅ Dizem o que editam ("Editar o controle de estoque"), e não só "Controle ativo Editar".

**13.5 — Fonte ampliada, varredura geral.** Ainda com a fonte no máximo, passe por Home, Cadastro,
Remédios, Estoque e Ajustes.

🔬 **Anote qualquer texto cortado, botão espremido ou linha sobreposta.** É o defeito mais provável
de sobrar, e o mais fácil de ver.

---

## 14 — Regressão: todas as telas

**Por que este bloco existe.** O passe de design mexeu em tipografia, cor, espaçamento e no
comportamento de todo elemento tocável. Nada disso é local: uma escala de fonte que mudou aparece
em telas que ninguém abriu de propósito para editar.

Percorra **todas** as telas procurando quatro coisas: **texto cortado**, **botão espremido**,
**contraste ruim** e **layout quebrado**.

| Tela | O que olhar em especial |
|---|---|
| **Home** | Respiro entre os blocos (aumentou), progresso, dose atrasada, estado vazio |
| **Remédios** | Busca com foco, ícones com fundo, alinhamento com **e sem** foto na mesma lista |
| **Estoque** | "Repor" azul ≠ "Recontar", previsão de término, aviso de recontagem |
| **Calendário** | Grade **não deve ter mudado**; dia selecionado redondo; pontos visíveis quando selecionado |
| **Adesão** | Bloco azul do número, tabela por medicamento (cores das faixas continuam ali), botão do PDF, seletor de medicamentos |
| **Cadastro de medicamento** | ⚠️ o mais longo: revelação progressiva, popups, rodapé, sugestões, dias da semana |
| **Cadastro de compromisso** | Campos, cascata de lembretes, data no passado |
| **Ficha de saúde** | Foto, contatos de emergência, selos, banner azul |
| **Horário** | Cartão, Tomei/Pulei com estado marcado, "Ignorar por agora" |
| **Alarme** | Tela cheia azul, **foto do remédio** (nova), som em loop, as quatro saídas |
| **Ajustes / Conta** | O hero original — ele inspirou o resto e **não pode ter regredido** |
| **Login / Consentimento / Termos** | Não foram tocados de propósito: confirmar que continuam iguais |
| **Scanner** | Câmera, moldura, entrada manual |

**Depois, repita com a fonte do sistema no máximo** (Configurações → Tela → Tamanho da fonte).

🔬 **É aqui que altura travada aparece.** Duas varreduras já acharam o mesmo defeito em lugares
diferentes — sempre onde uma tela desenhou o próprio botão em vez de usar o do kit. Se algum texto
cortar, anote a tela e o elemento: é o mesmo padrão, e a correção é conhecida.

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

| Sessão | O que cobre | Tempo |
|---|---|---|
| **1 — Entrar** | apagamento, os dois logins, ficha, termos | ~20 min |
| **2 — Cadastrar** | formas farmacêuticas, frequências, anexos, lembrete | ~50 min |
| **3 — Usar** | listagem, Home, estoque, calendário, compromissos | ~40 min |
| **4 — Sair** | conta, apagamento parcial e total | ~15 min |

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

**2.9 — Lembrete.** Popup **"Configurar lembrete"**.

> ✅ Três opções, e **"Nenhum aviso" não existe**.
> ✅ **Alarme** e **Notificação** dividem a primeira linha; **Os dois** ocupa a linha de baixo.
> ✅ Em "Como funcionam os alertas", o scroll desce **e sobe**.
> ✅ "Ler os Termos" e voltar retorna **ao popup, com a ajuda ainda aberta**.

**2.10 — Prazo × estoque.** `Amoxicilina`, dose 2, 3× de 8/8h desde `06:00`, prazo 7 dias, estoque
20.

> ✅ Avisa que o tratamento consome 42 e você tem 20.

**2.11 — Doses de hoje já passadas.** *(De tarde ou à noite.)*

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
