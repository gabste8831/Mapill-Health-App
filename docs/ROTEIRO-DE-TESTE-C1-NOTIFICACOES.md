# Roteiro de teste — C1, notificações e alarmes de dose

> O bloco de **maior risco técnico do projeto**. Ele é a promessa central do Mapill: o app que
> avisa na hora, mesmo fechado.
>
> Este roteiro faz duas coisas ao mesmo tempo: **conferir a implementação** e **fechar o spike de
> viabilidade** que o plano exige (§C1.0). Os itens marcados 🔬 são as perguntas do spike que só o
> aparelho responde — anote a resposta delas, porque elas viram registro no plano.
>
> **Precisa de aparelho físico Android.** Emulador não serve: o que está em jogo é o comportamento
> do sistema com o app fechado e sob economia de bateria.
>
> Tempo: **40 a 50 minutos**, com esperas.

## Antes de começar

⚠️ **Build nova é obrigatória.** O `app.json` ganhou três permissões novas, e permissão não entra
por recarga do Metro. Instale a build antes de qualquer coisa.

Desinstale a anterior: as permissões são concedidas na instalação, e o Android guarda decisões
antigas.

```bash
npx expo start --dev-client
```

**Confirme em 10 segundos que é a build certa:** cadastre qualquer remédio com lembrete
(**Alarme**). Na primeira vez, o Android tem que **pedir permissão de notificações**. Se não pedir,
a build é antiga.

## Como reportar

Só o que falhar, com o número. Nos itens 🔬, escreva a resposta mesmo quando passar.

---

## 1 — Permissão (C1.7)

**1.1** App recém-instalado. Vá em **Remédios** → **+** → **Cadastro manual**.

**1.2** Preencha o mínimo: nome `Teste Aviso`, **Comprimido**, dose `1`, **Todo dia**, **1×**,
horário **daqui a 3 minutos**, **Uso contínuo**.

**1.3** 🔴 Antes de salvar, abra **"Configurar lembrete"** e toque em **Alarme**.

> ✅ 🔴 O Android pede permissão de notificações **neste momento** — não antes.
> ✅ O texto do Alarme diz **"Toca alto e vibra, mesmo no silencioso"**.
> ❌ Se disser "como despertador", o texto é antigo.

**1.4** **Permita** e salve o cadastro.

**1.5** 🔴 Agora teste a recusa: vá em **Configurações do Android** → Apps → Mapill →
**Notificações** e **desligue**.

**1.6** Volte ao app, abra um cadastro e vá em **"Configurar lembrete"** → **Alarme**.

> ✅ 🔴 Aparece um bloco **amarelo** dizendo que os avisos estão bloqueados.
> ✅ 🔴 Ele tem o link **"Abrir as configurações do app"**, e o link funciona.
> ✅ 🔴 O app **não** tenta pedir a permissão de novo com um diálogo (no Android ele não abriria).

**1.7** Religue a permissão nas configurações e volte ao app.

> ✅ O bloco amarelo some sozinho — sem precisar reabrir o app.

---

## 2 — O aviso dispara com o app fechado 🔬 (a pergunta central)

**2.1** Cadastre `Teste Fechado`, dose `1`, **Todo dia**, **1×**, horário **daqui a 3 minutos**,
**Uso contínuo**, lembrete **Alarme**.

**2.2** 🔴 **Feche o app completamente** — botão de recentes, deslize para fora.

**2.3** Deixe o celular na mesa e espere o horário.

> ✅ 🔴 **A notificação aparece com o app fechado.**
> ✅ 🔴 Ela aparece **por cima** da tela (heads-up), não só na barra.
> ✅ 🔴 Tem som e vibração longa.
> ✅ O título é `HH:MM — Teste Fechado` e o corpo diz `Teste Fechado — 1 comprimido`.
> ✅ Tem os botões **Tomei** e **Adiar 5 min**.

🔬 **Anote:** quanto tempo depois do horário exato ela chegou? (No horário? 1 min depois? Mais?)
Isso responde a pergunta do spike sobre o alarme exato.

---

## 3 — Vários remédios no mesmo horário 🔴 (a decisão de agrupar)

**3.1** Cadastre **dois** remédios diferentes, ambos com horário **daqui a 4 minutos**:
`Losartana` (dose `1`) e `Metformina` (dose `2`). Lembrete **Alarme** nos dois.

**3.2** Feche o app e espere.

> ✅ 🔴 Chega **UMA notificação só**, não duas.
> ✅ 🔴 O título diz **`HH:MM — 2 remédios`**.
> ✅ 🔴 O corpo lista os dois, um por linha, com a dose de cada:
>    `Losartana — 1 comprimido` / `Metformina — 2 comprimidos`.
> ✅ 🔴 O botão diz **"Tomei todas"**, e não "Tomei".

**3.3** 🔴 **Não toque nos botões.** Toque no **corpo** da notificação.

> ✅ 🔴 O app abre direto na tela **"Hora do remédio"** — não na Home.
> ✅ 🔴 Os dois remédios estão listados, cada um com **Tomei** e **Pulei** próprios.
> ✅ No topo, diz quantas doses esperam resposta.

**3.4** 🔴 Toque em **Tomei** só na Losartana.

> ✅ 🔴 Ela ganha o selo **Tomada** e fica esmaecida; a Metformina continua esperando.
> ✅ O texto do topo passa a dizer **1 dose esperando resposta**.

**3.5** Toque em **Pulei** na Metformina.

> ✅ Ela ganha o selo **Pulada**.
> ✅ O topo diz **Tudo respondido por aqui**.

**3.6** Vá em **Remédios** → **Estoque** (se tiver cadastrado) e confira.

> ✅ Só a Losartana descontou. Pulada não consome.

---

## 4 — Os botões da notificação (C1.5)

**4.1** Cadastre `Teste Botao`, dose `2`, **daqui a 3 minutos**, estoque `20`, lembrete **Alarme**.

**4.2** Feche o app. Quando a notificação chegar, toque em **Tomei**.

> ✅ 🔴 A notificação **some** e o app **não abre**.
> ✅ 🔴 Abrindo o app depois, a dose aparece como **já confirmada** na Home.
> ✅ 🔴 O estoque caiu **2** (pela dose), e não 1.

**4.3** 🔴 Cadastre outro para **daqui a 3 minutos**. Quando chegar, toque em **Adiar 5 min**.

> ✅ 🔴 A notificação some.
> ✅ 🔴 **Cinco minutos depois** ela volta, com o mesmo conteúdo.
> ✅ 🔴 Na segunda vez, **o botão "Adiar" não existe mais** — só "Tomei".
>    *(Um adiamento por horário. O botão some em vez de aparecer e não funcionar.)*

**4.4** 🔴 O teste que prova que adiar não registra nada: **antes** de o aviso adiado voltar, abra
o app e olhe a Home.

> ✅ 🔴 A dose **não** aparece como pulada, nem confirmada, nem nada. Continua pendente.
> ❌ Se aparecer com qualquer status, o adiar está registrando desfecho — e não devia.

**4.5** 🔴 Ainda antes de o aviso voltar, confirme essa dose **pela Home**.

> ✅ 🔴 Quando o aviso adiado chegar, ele **não** menciona esse remédio (ou não chega, se era o
> único). O aviso é recalculado, então só traz o que ainda está pendente.

---

## 5 — Nada de alarme órfão 🔴 (o pior defeito possível)

**5.1** Cadastre `Vai Sumir`, horário **daqui a 5 minutos**, lembrete **Alarme**.

**5.2** 🔴 **Exclua o medicamento** (lixeira na lista de Remédios). Feche o app.

> ✅ 🔴 **A notificação NÃO chega.**
> ❌ Se chegar, é alarme órfão — o pior bug deste bloco. Avise imediatamente.

**5.3** Cadastre `Vai Mudar`, horário **daqui a 4 minutos**, lembrete **Alarme**.

**5.4** 🔴 **Edite** e mude o horário para **daqui a 10 minutos**. Feche o app.

> ✅ 🔴 Nada chega no horário antigo.
> ✅ 🔴 Chega no horário novo.

**5.5** Cadastre `Vai Desligar`, **daqui a 4 minutos**, lembrete **Alarme**.

**5.6** 🔴 Edite e mude o lembrete para... **feche o popup sem escolher nada** (isso é `none`).
Feche o app.

> ✅ 🔴 Nada chega. Não configurar já é recusar.

---

## 6 — Notificação com o app aberto

**6.1** Cadastre um remédio para **daqui a 3 minutos**, lembrete **Alarme**.

**6.2** 🔴 Deixe o app **aberto**, numa tela qualquer (Calendário, por exemplo).

> ✅ 🔴 A notificação aparece mesmo assim, por cima da tela.
> ✅ 🔴 O app **não** empilha tela sobre tela nem abre nada sozinho.

**6.3** Toque nela.

> ✅ Vai para a tela do horário normalmente.

---

## 7 — Alarme × Notificação (a diferença tem que ser real)

**7.1** 🔴 Ative o **Não Perturbe** do Android.

**7.2** Cadastre um remédio com lembrete **Notificação** (não alarme), **daqui a 3 minutos**.
Feche o app.

> ✅ Chega silenciosa, respeitando o Não Perturbe.

**7.3** Cadastre outro com lembrete **Alarme**, **daqui a 3 minutos**. Feche o app.

> ✅ 🔴 **Toca e vibra mesmo com o Não Perturbe ligado.**
> ❌ Se ficar silencioso igual ao anterior, o `bypassDnd` não funcionou — e aí as duas opções do
> app viraram a mesma coisa, o que exige mudar o texto.

🔬 **Anote:** a diferença entre os dois foi perceptível?

---

## 8 — Sobrevivência 🔬 (as perguntas 4 e 5 do spike)

**8.1** 🔬 Cadastre um remédio com **4 horários por dia**, uso contínuo, lembrete Alarme.

**8.2** 🔬 Abra o app, deixe carregar, e feche.

> Isso agenda ~28 avisos (4 por dia × 7 dias da janela).

**8.3** 🔬 **Reinicie o celular.** Depois do reboot, **não abra o app** e espere o próximo horário.

> ✅ 🔴 A notificação chega mesmo depois do reboot, sem o app ter sido aberto.
> ❌ Se não chegar, anote — significa que dependemos do app ser aberto uma vez após cada reboot.

**8.4** 🔬 **O teste mais importante e o mais chato:** deixe um remédio agendado para **daqui a
8 ou 12 horas** (durante a noite serve), com o celular **sem carregador**, app fechado, e a
economia de bateria do fabricante ativa.

> 🔬 **Anote:** o aviso chegou? No horário ou atrasado?
>
> Este é o item que decide se o app precisa de uma tela orientando a desativar a otimização de
> bateria para o Mapill. Xiaomi, Samsung e Motorola são os mais agressivos.

**8.5** 🔬 Se quiser conferir o dimensionamento: cadastre 3 ou 4 remédios com vários horários,
abra o app, e depois olhe se todos os avisos chegam ao longo do dia.

> 🔬 **Anote:** algum horário foi pulado?

---

## 9 — Casos de borda (C1.8)

**9.1** 🔴 Cadastre um remédio para **00:30** (madrugada) e confira no dia seguinte.

> ✅ Chega às 00:30, e não às 21:30 ou outro horário deslocado (bug de fuso).

**9.2** 🔴 Confirme uma dose pela Home **antes** do horário dela. Feche o app e espere o horário.

> ✅ 🔴 A notificação **não** chega — a dose já foi respondida.

**9.3** Deixe passar de um horário sem responder e abra a Home.

> ✅ A dose aparece como **atrasada** (vermelha), como já era antes.

---

## Depois do roteiro

Me manda:

1. **As falhas**, com o número do passo.
2. **As respostas dos 🔬**, mesmo as que passaram — elas viram registro no plano e fecham
   formalmente o spike de viabilidade do C1.

Com isso o C1 fecha e o próximo passo é o **C2** (a tela do horário já existe, falta o resto do
bloco) ou o **C3**, conforme você preferir.
