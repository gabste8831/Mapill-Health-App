# Roteiro de teste em aparelho

> **Este é o único roteiro de teste do projeto.** Os roteiros datados das revisões anteriores
> (26/08, 27/08, 29/08) foram cumpridos e removidos — o que eles apuraram virou registro no
> [`PLANO-DE-DESENVOLVIMENTO.md`](./PLANO-DE-DESENVOLVIMENTO.md), §6.2 e log de progresso.
>
> Ele tem **duas partes**, e elas se leem em momentos diferentes:
>
> | | Quando | Tempo |
> |---|---|---|
> | **[Parte 1 — Notificações e o que é novo](#parte-1--c1-notificações-e-alarmes-de-dose)** | **Agora**, com a build nova | ~1 h |
> | **[Parte 2 — Validação completa](#parte-2--validação-completa-antes-da-defesa)** | Antes da defesa | ~2 h |
>
> Depois da Parte 1, o próximo documento é o [`ROTEIRO-DE-PRINTS.md`](./ROTEIRO-DE-PRINTS.md).

## Como reportar

Só o que falhar, com o número do passo:

```
2.3 falhou — a notificação não chegou com o app fechado
5.2 falhou — o aviso do remédio excluído chegou mesmo assim
resto ok
```

🔴 marca os passos que existem para pegar um bug específico. Se um deles falhar, **avise** — os
seguintes costumam depender dele.

🔬 marca as perguntas do **spike de viabilidade** que só o aparelho responde. Anote a resposta
delas **mesmo quando passarem**: elas fecham formalmente o C1 no plano.

---

# PARTE 1 — C1: notificações e alarmes de dose

O bloco de **maior risco técnico do projeto**, e a promessa central do Mapill: o app que avisa na
hora, mesmo fechado.

> 🔁 **Rodada de 30/08.** Duas coisas ao mesmo tempo:
>
> **Reteste** — a execução de 29/08 rendeu oito correções. Refaça os blocos **1, 2, 4 e 7**; os
> blocos 3, 5 e 6 passaram e a lógica deles não mudou. Os blocos **8 e 9** seguem por fazer, e o 8
> depende do alarme funcionar.
>
> **Estreia** — os blocos **10 a 14** são de código que nunca rodou em aparelho: aviso de permissão
> na Home, avisos de compromisso e receita (C3), relatório de adesão (D2), sugestão de medicamento
> pelo nome (B1) e leitura de código de barras (B3).
>
> Além dos blocos, confira de passagem: a miniatura do anexo aparece **na hora** (não branca), o
> teclado fecha ao tocar fora do campo, definir horário virou **uma etapa** (campo digitável com
> relógio ao lado), e na Home a dose vira **ATRASADA** sozinha 30 min depois do horário.

## Antes de começar

⚠️ **Build nova é obrigatória.** O `app.json` ganhou três permissões (`POST_NOTIFICATIONS`,
`SCHEDULE_EXACT_ALARM`, `USE_EXACT_ALARM`), e permissão não entra por recarga do Metro.

⚠️ **Desinstale o Mapill anterior antes de instalar.** Dois motivos que se somam: as permissões são
concedidas na instalação e o Android guarda decisões antigas; e os canais de notificação subiram
para `v2` — um canal já criado fica **congelado** no aparelho, e som e importância não mudam por
atualização. Instalar por cima manteria o alarme mudo mesmo com a correção.

⚠️ **Precisa de aparelho físico.** Emulador não serve para os blocos 2, 5 e 8: o que está em jogo é
o comportamento do sistema com o app fechado e sob economia de bateria.

```bash
npx expo start --dev-client
```

**Confirme em 10 segundos que é a build certa:** cadastre qualquer remédio com lembrete
**Alarme**. Na primeira vez, o Android tem que **pedir permissão de notificações**. Se não pedir, a
build é antiga.

---

## 1 — Permissão

**1.1** App recém-instalado. Vá em **Remédios** → **+** → **Cadastro manual**.

**1.2** Preencha o mínimo: nome `Teste Aviso`, **Comprimido**, dose `1`, **Todo dia**, **1×**,
horário **daqui a 3 minutos**, **Uso contínuo**.

**1.3** 🔴 Antes de salvar, abra **"Configurar lembrete"** e toque em **Alarme**.

> ✅ 🔴 O Android pede permissão de notificações **neste momento** — não antes.
> ✅ O texto do Alarme diz **"Toca alto e vibra, mesmo no silencioso"**.
> ❌ Se disser "como despertador", o texto é antigo.

**1.4** **Permita** e salve o cadastro.

**1.5** 🔴 Teste a recusa: **Configurações do Android** → Apps → Mapill → **Notificações** →
**desligue**.

**1.6** Volte ao app, abra um cadastro e vá em **"Configurar lembrete"** → **Alarme**.

> ✅ 🔴 Aparece um bloco **amarelo** dizendo que os avisos estão bloqueados.
> ✅ 🔴 Ele tem o link **"Abrir as configurações do app"**, e o link funciona.
> ✅ 🔴 O app **não** tenta pedir a permissão de novo (no Android o diálogo não abriria).

**1.7** Religue a permissão e volte ao app.

> ✅ O bloco amarelo some sozinho — sem precisar reabrir o app.

---

## 2 — O aviso dispara com o app fechado 🔬

**A pergunta central do bloco.**

**2.1** Cadastre `Teste Fechado`, dose `1`, **Todo dia**, **1×**, horário **daqui a 3 minutos**,
**Uso contínuo**, lembrete **Alarme**.

**2.2** 🔴 **Feche o app completamente** — recentes, deslize para fora.

**2.3** Deixe o celular na mesa e espere.

> ✅ 🔴 **A notificação aparece com o app fechado.**
> ✅ 🔴 Ela aparece **por cima** da tela (heads-up), não só na barra.
> ✅ 🔴 Tem som e vibração longa.
> ✅ Título `HH:MM — Teste Fechado`, corpo `Teste Fechado — 1 comprimido`.
> ✅ Botões **Tomei** e **Adiar 5 min**.

🔬 **Anote:** quanto tempo depois do horário exato ela chegou? (No horário? 1 min? Mais?)

---

## 3 — Vários remédios no mesmo horário 🔴

**3.1** Cadastre **dois** remédios com horário **daqui a 4 minutos**: `Losartana` (dose `1`) e
`Metformina` (dose `2`). Lembrete **Alarme** nos dois.

**3.2** Feche o app e espere.

> ✅ 🔴 Chega **UMA notificação só**, não duas.
> ✅ 🔴 Título: **`HH:MM — 2 remédios`**.
> ✅ 🔴 Corpo lista os dois, um por linha:
>    `Losartana — 1 comprimido` / `Metformina — 2 comprimidos`.
> ✅ 🔴 O botão diz **"Tomei todas"**, e não "Tomei".

**3.3** 🔴 **Não toque nos botões.** Toque no **corpo** da notificação.

> ✅ 🔴 O app abre direto na tela **"Hora do remédio"** — não na Home.
> ✅ 🔴 Os dois estão listados, cada um com **Tomei** e **Pulei** próprios.
> ✅ No topo, diz quantas doses esperam resposta.

**3.4** 🔴 Toque em **Tomei** só na Losartana.

> ✅ 🔴 Ela ganha o selo **Tomada** e fica esmaecida; a Metformina continua esperando.
> ✅ O topo passa a dizer **1 dose esperando resposta**.

**3.5** Toque em **Pulei** na Metformina.

> ✅ Selo **Pulada**. O topo diz **Tudo respondido por aqui**.

**3.6** Vá em **Remédios** → **Estoque** e confira.

> ✅ Só a Losartana descontou. Pulada não consome.

---

## 4 — Os botões da notificação

**4.1** Cadastre `Teste Botao`, dose `2`, **daqui a 3 minutos**, estoque `20`, lembrete **Alarme**.

**4.2** Feche o app. Quando chegar, toque em **Tomei**.

> ✅ 🔴 A notificação **some** e o app **não abre**.
> ✅ 🔴 Abrindo depois, a dose aparece **já confirmada** na Home.
> ✅ 🔴 O estoque caiu **2** (pela dose), e não 1.

**4.3** 🔴 Cadastre outro para **daqui a 3 minutos**. Quando chegar, toque em **Adiar 5 min**.

> ✅ 🔴 A notificação some.
> ✅ 🔴 **Cinco minutos depois** ela volta, com o mesmo conteúdo.
> ✅ 🔴 Na segunda vez, **o botão "Adiar" não existe mais** — só "Tomei".
>    *(Um adiamento por horário: o botão some em vez de aparecer e não funcionar.)*

**4.4** 🔴 **Antes** de o aviso adiado voltar, abra o app e olhe a Home.

> ✅ 🔴 A dose **não** aparece como pulada, nem confirmada. Continua pendente.
> ❌ Se aparecer com qualquer status, o adiar está registrando desfecho — e não devia.

**4.5** 🔴 Ainda antes de o aviso voltar, confirme essa dose **pela Home**.

> ✅ 🔴 O aviso adiado **não** menciona esse remédio (ou não chega, se era o único). Ele é
> recalculado, então só traz o que ainda está pendente.

---

## 5 — Nada de alarme órfão 🔴

**O pior defeito possível deste bloco: lembrete de um remédio que a pessoa já parou de tomar.**

**5.1** Cadastre `Vai Sumir`, **daqui a 5 minutos**, lembrete **Alarme**.

**5.2** 🔴 **Exclua o medicamento** (lixeira na lista). Feche o app.

> ✅ 🔴 **A notificação NÃO chega.**
> ❌ Se chegar, avise imediatamente.

**5.3** Cadastre `Vai Mudar`, **daqui a 4 minutos**, lembrete **Alarme**.

**5.4** 🔴 **Edite** e mude o horário para **daqui a 10 minutos**. Feche o app.

> ✅ 🔴 Nada chega no horário antigo.
> ✅ 🔴 Chega no horário novo.

**5.5** Cadastre `Vai Desligar`, **daqui a 4 minutos**, lembrete **Alarme**.

**5.6** 🔴 Edite e **feche o popup de lembrete sem escolher nada**. Feche o app.

> ✅ 🔴 Nada chega. Não configurar já é recusar.

---

## 6 — Notificação com o app aberto

**6.1** Cadastre um remédio para **daqui a 3 minutos**, lembrete **Alarme**.

**6.2** 🔴 Deixe o app **aberto**, numa tela qualquer.

> ✅ 🔴 A notificação aparece mesmo assim, por cima da tela.
> ✅ 🔴 O app **não** empilha tela sobre tela nem abre nada sozinho.

**6.3** Toque nela.

> ✅ Vai para a tela do horário normalmente.

---

## 7 — Alarme × Notificação 🔬

**A diferença tem que ser real — o app oferece as duas como escolhas distintas.**

**7.1** 🔴 Ative o **Não Perturbe** do Android.

**7.2** Cadastre um remédio com lembrete **Notificação**, **daqui a 3 minutos**. Feche o app.

> ✅ Chega silenciosa, respeitando o Não Perturbe.

**7.3** Cadastre outro com **Alarme**, **daqui a 3 minutos**. Feche o app.

> ✅ 🔴 **Toca e vibra mesmo com o Não Perturbe ligado.**
> ❌ Se ficar silencioso igual ao anterior, o `bypassDnd` não funcionou — e as duas opções viraram
> a mesma coisa, o que exige mudar o texto do app.

🔬 **Anote:** a diferença foi perceptível?

---

## 8 — Sobrevivência 🔬

**8.1** Cadastre um remédio com **4 horários por dia**, uso contínuo, lembrete Alarme.

**8.2** Abra o app, deixe carregar, e feche. *(Isso agenda ~28 avisos: 4/dia × 7 dias da janela.)*

**8.3** 🔬 **Reinicie o celular.** Depois do reboot, **não abra o app** e espere o próximo horário.

> ✅ 🔴 A notificação chega mesmo depois do reboot, sem o app ter sido aberto.
> ❌ Se não chegar, anote — significa que dependemos do app ser aberto após cada reboot.

**8.4** 🔬 **O mais importante e o mais chato:** deixe um remédio agendado para **daqui a 8 ou 12
horas** (a noite serve), celular **sem carregador**, app fechado, economia de bateria do fabricante
ativa.

> 🔬 **Anote:** chegou? No horário ou atrasado?
>
> Decide se o app precisa de uma tela orientando a desativar a otimização de bateria. Xiaomi,
> Samsung e Motorola são os mais agressivos.

**8.5** 🔬 Opcional: cadastre 3 ou 4 remédios com vários horários e veja se todos chegam ao longo
do dia.

> 🔬 **Anote:** algum horário foi pulado?

---

## 9 — Casos de borda

**9.1** 🔴 Cadastre um remédio para **00:30** e confira no dia seguinte.

> ✅ Chega às 00:30, e não em outro horário deslocado (bug de fuso).

**9.2** 🔴 Confirme uma dose pela Home **antes** do horário. Feche o app e espere o horário.

> ✅ 🔴 A notificação **não** chega — a dose já foi respondida.

**9.3** Deixe passar de um horário sem responder e abra a Home.

> ✅ A dose aparece como **atrasada** (vermelha).

---

---

## 10 — Aviso de permissão na Home 🔴

**10.1** Com pelo menos um remédio com lembrete cadastrado, vá em **Configurações do Android** →
Apps → Mapill → **Notificações** → **desligue**.

**10.2** Volte ao app e olhe a **Home**.

> ✅ 🔴 Um card **amarelo** no topo, **antes da agenda**, dizendo que o Mapill não vai avisar.
> ✅ Ele diz quantos tratamentos estão esperando lembrete.
> ✅ Tem o botão **"Religar os avisos"**, que abre as configurações.

**10.3** Religue a permissão e volte.

> ✅ 🔴 O card some sozinho, sem precisar reabrir o app.

**10.4** 🔴 Desligue a permissão de novo, e **exclua todos os remédios com lembrete**.

> ✅ 🔴 O card **não** aparece — sem tratamento esperando aviso, não há o que cobrar.

---

## 11 — Avisos de compromisso e receita 🔴 (C3)

**11.1** **Calendário** → **+** → compromisso `Consulta de teste`, para **amanhã**, com lembrete
**no dia** e **1 dia de antecedência**.

> ✅ 🔴 O texto embaixo diz que os avisos chegam **às 8 da manhã**, por notificação.
> ❌ Se disser que os lembretes "ainda estão sendo desenvolvidos", o texto é antigo.

**11.2** 🔬 O aviso de antecedência cai hoje às 8h — se já passou das 8, ele não é agendado (é o
comportamento correto). Para testar de verdade, cadastre um compromisso para **daqui a 2 dias**
com antecedência de **1 dia**, e confira amanhã de manhã.

> ✅ Chega uma notificação **"Compromisso amanhã"** com o nome e a data por extenso.
> ✅ 🔴 Ela **não toca alarme** — é notificação, e respeita o silencioso.

**11.3** 🔴 Exclua esse compromisso antes de o aviso chegar.

> ✅ 🔴 O aviso **não** chega. *(Mesmo teste de alarme órfão do bloco 5, agora para compromisso.)*

**11.4** Num remédio, anexe uma receita com **validade daqui a 8 dias** e peça aviso com **7 dias**
de antecedência.

> ✅ 🔬 Amanhã de manhã chega **"Receita vencendo"**, dizendo qual remédio e a data.

---

## 12 — Relatório de adesão 🔴 (D2)

**12.1** Na **Home**, toque no card **"Acompanhamento semanal"** (o das barrinhas).

> ✅ 🔴 Abre a tela **"Minha adesão"**.

**12.2** Olhe o número grande.

> ✅ 🔴 Mostra a porcentagem e, embaixo, "X de Y doses tomadas".
> ✅ 🔴 **As doses de hoje que ainda não venceram NÃO entram na conta.** Confira: se você tem uma
> dose às 22h e são 15h, ela não pode estar contando contra você.

**12.3** Olhe os dois quadros lado a lado.

> ✅ 🔴 **Puladas** e **sem resposta** são números **separados**, cada um com sua explicação.

**12.4** Com mais de um remédio cadastrado, role até **"Por medicamento"**.

> ✅ 🔴 Ordenado do **pior para o melhor** — quem está falhando aparece primeiro.

**12.5** Troque o período para **7 dias** e **90 dias**.

> ✅ Os números mudam de acordo.

**12.6** 🔴 Num app recém-instalado, sem dose vencida ainda:

> ✅ 🔴 Diz **"Ainda não há o que medir"**, e **nunca "0%"**.

---

## 13 — Busca de medicamento 🔴 (B1)

**13.1** **Remédios** → **+** → **Cadastro manual**. No campo **NOME DA MEDICAÇÃO**, digite `dipi`.

> ✅ 🔴 Aparece uma lista **"Encontrados na base da Anvisa"** com sugestões.
> ✅ Cada linha mostra o nome, a dosagem em azul e o princípio ativo embaixo.
> ⏳ Se não aparecer nada na **primeira abertura** do app, espere alguns segundos: a base está
> sendo importada em segundo plano. Feche e abra o cadastro de novo.

**13.2** 🔴 Toque numa sugestão.

> ✅ 🔴 O nome é preenchido **com a dosagem** junto.
> ✅ 🔴 A lista **some**.
> ✅ 🔴 Descendo até **INFORMAÇÕES ADICIONAIS**, o **princípio ativo** já está preenchido.
> ✅ 🔴 **Forma farmacêutica, dose e horários continuam vazios** — a base não adivinha posologia.

**13.3** 🔴 Apague uma letra do nome.

> ✅ 🔴 As sugestões voltam a aparecer.

**13.4** Digite um nome que não existe, tipo `xyzabc`.

> ✅ Nenhuma sugestão, e **nenhuma mensagem de erro** — o cadastro segue normal.

---

## 14 — Código de barras 🔴 (B3)

⚠️ **Exige a build nova**: `expo-camera` é dependência nativa.

**14.1** **Remédios** → **+** → **Escanear código de barras**.

> ✅ 🔴 Pede permissão de câmera, explicando que **nenhuma foto é tirada ou guardada**.
> ✅ 🔴 Recusando, aparece o botão **"Cadastrar sem escanear"** — não é beco sem saída.

**14.2** Permita e aponte para a **caixa de um remédio comum** (dipirona, paracetamol).

> ✅ 🔴 Uma moldura branca mostra onde mirar.
> ✅ 🔴 Ao ler, mostra o remédio encontrado com nome, dosagem e princípio ativo.

**14.3** 🔴 Toque em **"Continuar o cadastro"**.

> ✅ 🔴 Abre o formulário **já preenchido** com nome e princípio ativo.
> ✅ 🔴 A posologia continua vazia.
> ✅ 🔴 Voltando dessa tela, você vai para a **escolha de cadastro** — e não para a câmera de novo.

**14.4** 🔴 Escaneie um código que **não seja de remédio** (um pacote de bolacha, por exemplo).

> ✅ 🔴 Diz **"Código não encontrado"**, explica por que acontece, mostra o número lido, e oferece
> **"Cadastrar à mão"** e **"Ler outro código"**.
> ❌ Não pode travar nem voltar sozinho.

---

## Ao terminar a Parte 1

Me manda:

1. **As falhas**, com o número do passo.
2. **As respostas dos 🔬**, mesmo as que passaram.

Com isso o C1 fecha formalmente e seguimos para o [`ROTEIRO-DE-PRINTS.md`](./ROTEIRO-DE-PRINTS.md).

---
---

# PARTE 2 — Validação completa (antes da defesa)

> **Não é para agora.** Esta parte é a passada final antes da apresentação, quando o app estiver
> fechado. Ela percorre o app inteiro do zero, como quem nunca o abriu.
>
> Começa apagando tudo e termina apagando tudo de novo — o primeiro apagamento é para chegar ao
> zero, o último é para testar o direito de exclusão (LGPD).
>
> **Percorrer na ordem:** os cadastros do começo alimentam os testes do meio.

## As quatro sessões

Dá para parar entre elas. Dentro de uma sessão, não.

| Sessão | O que cobre | Tempo |
|---|---|---|
| **1 — Entrar** | apagamento inicial, os dois caminhos de login, ficha, termos | ~20 min |
| **2 — Cadastrar** | todas as formas farmacêuticas, frequências, anexos, lembrete | ~50 min |
| **3 — Usar** | listagem, Home, estoque, calendário, compromissos, notificações | ~40 min |
| **4 — Sair** | conta, apagamento parcial, apagamento total | ~15 min |

## De onde vem o login com Google

O `.env` **não sobe para o EAS** (está no `.easignore`), então uma build `preview`/`production` sem
as variáveis cadastradas no servidor sai com o login indisponível.

| Build | De onde vem o JS | De onde vêm as credenciais |
|---|---|---|
| `development` + `npx expo start --dev-client` | Metro da sua máquina | `.env` local |
| `preview` / `production` | bundle do servidor EAS | variáveis de ambiente do EAS |

Cadastradas nos três ambientes: `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
Conferir com `eas env:list --environment preview`. Se o login disser "indisponível nesta versão", é
aqui que se olha primeiro.

---

## SESSÃO 1 — Entrar

**1.1** **Ajustes** → **MEUS DADOS** → **"Apagar tudo e recomeçar"** → **Continuar** →
**Apagar tudo**.

> ✅ 🔴 O app volta para a **tela de login**, como recém-instalado.
> ✅ O segundo diálogo **repete o que acontece** — não só pergunta "tem certeza?".

**1.2** Na tela de login, leia o rodapé.

> ✅ Diz que os dados ficam no aparelho com ou sem conta, e que entrar **prepara** a cópia na
> nuvem, que ainda não está disponível.
> ❌ Não pode prometer backup.

**1.3** 🔴 **"Continuar sem login"** → no consentimento, toque na **seta de voltar**.

> ✅ Volta para o login. A escolha de entrada é arrependível.

**1.4** Entre de novo, **aceite os termos**, e na ficha toque no **botão físico de voltar**.

> ✅ 🔴 Volta para o consentimento, **não** fecha o app.

**1.5** 🔴 Zere e teste o outro caminho: **"Continuar com Google"** → **feche o navegador sem
escolher conta**.

> ✅ 🔴 Volta ao app com aviso de login cancelado. Não trava nem entra em silêncio.

**1.6** Entre com o Google de verdade e complete a ficha.

> ✅ 🔴 Pede o aceite dos termos, e depois entra na Home.

**1.7** 🔴 Feche o app (recentes) e reabra, **três vezes**.

> ✅ 🔴 Vai direto para a Home. A tela de login **não pisca** antes.
> ✅ 🔴 A splash azul **sai sozinha** — o app nunca fica preso nela.

**1.8** **Ajustes** → toque no bloco azul da ficha.

> ✅ 🔴 O campo **DATA DE NASCIMENTO** tem ícone de calendário **e** aceita digitação.
> ✅ 🔴 `29/02/2025` é recusado; no calendário, o dia 29 de fev/2025 não existe e datas futuras
> estão apagadas.
> ✅ Tocando na **foto**, abre o popup com "Tirar foto agora" e "Escolher da galeria".

**1.9** **Ajustes** → **"Conta e dados"** → **"Termos e privacidade"**.

> ✅ 🔴 A linha tem **ícone de pessoa** (não o logo do Google).
> ✅ "Aceito em" mostra **data e horário**. Versão aceita = versão atual.

---

## SESSÃO 2 — Cadastrar

**2.1 — Comprimido, o caso comum.** `Losartana 50mg`, comprimido, dose `1`, **Todo dia**, **2×**,
`08:00` e `20:00`, uso contínuo, estoque `28`, local `Gaveta da cozinha`, avisar com `7 dias`.

> ✅ 🔴 No popup de horários, abrem **dois campos numéricos** — não o mostrador redondo.
> ✅ 🔴 É 24 horas: digitar `20` dá 20:00, sem AM/PM. `99` vira 23. `7` vira 07.
> ✅ 🔴 Tocando em "Pronto", **o teclado fecha junto** com o popup.
> ✅ Horário duplicado é barrado na digitação.

**2.2 — Líquido, unidade ambígua.** `Xarope`, **Líquido**.

> ✅ 🔴 Aparece **"COMO A DOSE É MEDIDA?"** antes da quantidade.
> ✅ 🔴 A dica do copinho tem fundo **amarelo claro** com barra amarela viva à esquerda.
> ✅ Escolha **ml**, dose `7,5` — a fração é aceita.

**2.3** 🔴 **Dependência entre campos.** Com o `7,5` preenchido, **volte** e troque a forma para
**Comprimido**.

> ✅ 🔴 O campo de dose **fica vazio** — comprimido não aceita fração.

**2.4** 🔴 Escolha **"Prazo definido"**, `7` dias. Troque para **"Uso contínuo"** e volte para
**"Prazo definido"**.

> ✅ 🔴 O campo de dias está **vazio** — o `7` não voltou sozinho.

**2.5 — Dose que varia.** `Insulina NPH`, **Injeção**, **UI**, dose `10`, **Todo dia**, **2×**.

> ✅ 🔴 Existe o checkbox **"A dose muda de um horário para o outro"**, junto da dose.
> ✅ Marque, defina `08:00` com `10` e `22:00` com `8`. As fichinhas mostram `08:00 · 10` e
> `22:00 · 8`.
> ✅ 🔴 Em "Preencher de X em X horas", uma frase diz que **as doses por horário são mantidas**.

**2.6 — Dias da semana e ciclo.** `Metformina`, **Dias da semana**, Seg/Qua/Sex, `12:00`.
Depois um com **ciclo** 21/7, cadastrado no meio da cartela.

> ✅ Dias alternados e pausa funcionam; erro de "dias ativos > tamanho do ciclo" é barrado.

**2.7 — Só quando precisar.** `Dipirona`, **Gotas**, dose `30` gotas, **Só quando precisar**,
estoque `20` **ml**.

> ✅ 🔴 Sem horário e sem data de início; o tempo vira "Sempre disponível".
> ✅ 🔴 O estoque pergunta em **ml**, não em gotas.

**2.8 — Anexos.** Na `Losartana`, seção **ANEXOS**.

> ✅ 🔴 A foto da caixa aparece **na hora**, e muda **toda vez** que você troca.
> ✅ 🔴 Existe o rótulo **RECEITA MÉDICA**, e tocando no quadrado abre um popup com **três**
> origens: câmera, galeria e arquivo.
> ✅ 🔴 Fora do quadrado há um único rótulo **"Adicionar arquivo"**.
> ✅ Com anexo escolhido: **"Alterar anexo"** e **"Remover"** (em vermelho).
> ✅ 🔴 Em **RECEITA VÁLIDA ATÉ**, os dias já passados estão apagados no calendário.

**2.9 — Lembrete.** Popup **"Configurar lembrete"**.

> ✅ 🔴 Três opções, e **"Nenhum aviso" não existe** — não configurar já é recusar.
> ✅ 🔴 **Alarme** e **Notificação** dividem a primeira linha; **Os dois** ocupa a linha inteira
> embaixo.
> ✅ 🔴 Abrindo "Como funcionam os alertas", o scroll desce **e sobe**.
> ✅ 🔴 Tocando em "Ler os Termos" e voltando, você retorna **ao popup, com a ajuda ainda aberta**.
> ✅ 🔴 O botão do fim **não está colado** na base da tela.

**2.10 — Prazo × estoque.** `Amoxicilina`, dose `2`, **3×** de 8 em 8h a partir de `06:00`,
**prazo** `7` dias, estoque `20`.

> ✅ 🔴 Avisa que o tratamento consome 42 e você tem 20.

**2.11 — Doses de hoje já passadas.** *(De tarde ou à noite.)* Cadastre com horários que já
passaram hoje.

> ✅ 🔴 Avisa quais horários de hoje não serão agendados.
> ✅ 🔴 Pergunta **"VOCÊ JÁ TOMOU ALGUMA DELAS HOJE?"**, nada vem marcado.
> ✅ 🔴 Marcando uma, diz que ela entra no histórico e que **o estoque não muda**.
> ✅ 🔴 Salvando, o estoque fica **exatamente** no que você digitou.

---

## SESSÃO 3 — Usar

**3.1 — Lista.** Aba **Remédios**.

> ✅ 🔴 O card da Insulina mostra `08:00 · 10 UI` e `22:00 · 8 UI`.
> ✅ 🔴 Rolando, o texto de apoio sobe e **a busca fica fixa**.
> ✅ Busca sem acento funciona (`acido` acha `Ácido`).
> ✅ Ordenação: **A–Z**, **Mais recentes**, **Acabando**.
> ✅ 🔴 O botão diz **"Gerenciar estoques"**.
> ✅ Editar abre preenchido; excluir avisa que o histórico é mantido.
> ✅ 🔴 O botão físico de voltar fecha o formulário.

**3.2 — Home.**

> ✅ Progresso do dia, próxima dose, atrasadas em vermelho.
> ✅ 🔴 Dose dentro da janela do horário aparece em **verde**, com **É AGORA**.
> ✅ 🔴 Passados 30 minutos, ela fica **vermelha** com **ATRASADA**.
> ✅ 🔴 "Confirmar todas" lista **os nomes** de cada dose no diálogo.
> ✅ 🔴 O estoque cai **pela dose**, não 1 por dose.
> ✅ 🔴 O card "Estoque" diz quantas medicações são controladas e termina com **"toque para
> gerenciar"**.

**3.3 — Estoque.**

> ✅ Ordenação: **Acaba primeiro**, **Menos na caixa**, **A–Z**.
> ✅ 🔴 A Insulina prevê **16 ou 17 dias** (10 + 8 = 18 UI/dia, não 2 × 10).
> ✅ 🔴 A Dipirona (gotas com estoque em ml) diz **"Sem previsão de término"**.
> ✅ "Recontar" mostra a diferença antes de confirmar.

**3.4 — Calendário.**

> ✅ 🔴 Grade do mês azul, com pontinhos nos dias com algo marcado.
> ✅ 🔴 Rolando, **a grade sobe junto** e só os filtros grudam no topo.
> ✅ Filtros **Tudo / Compromissos / Remédios** mudam a grade e a lista.
> ✅ 🔴 "Nada marcado para este dia" tem **espaço em volta**.
> ✅ 🔴 Avançando dois meses, as doses **continuam aparecendo** (são projetadas).

**3.5 — Compromissos.** Cadastre um futuro (5 dias) e um passado.

> ✅ 🔴 **DATA** e **HORÁRIO** estão em **linhas separadas**.
> ✅ 🔴 Com data/horário no passado, avisa e a seção **LEMBRETES some por completo**.
> ✅ 🔴 Configurando o lembrete e **depois** voltando a data para trás, avisa que **o lembrete foi
> descartado**.
> ✅ 🔴 No card do passado, existe **"Você foi?"** com **Fui** e **Não fui**, e dá para anotar.
> ✅ 🔴 O rótulo é **"COM QUANTOS DIAS DE ANTECEDÊNCIA"**, e **"OUTRO PRAZO, EM DIAS"** tem linha
> própria.
> ✅ `0` ou `999` dão erro pedindo entre 1 e 180.

**3.6 — Notificações.** Repita, resumido, os blocos 2, 3 e 5 da Parte 1.

> ✅ Chega com o app fechado; um aviso por horário; nenhum alarme órfão.

---

## SESSÃO 4 — Sair

**4.1** **Ajustes** → **Conta e dados** → **MEUS DADOS** → **"Apagar meus dados de saúde"**.

> ✅ O diálogo diz o que some e o que fica.
> ✅ 🔴 Confirmando, a ficha continua intacta e o acesso ao estoque **some** da Home e de Remédios.

**4.2** 🔴 Desvincule a conta do Google.

> ✅ 🔴 O diálogo explica que **nada é apagado** — nem no aparelho, nem na nuvem.
> *(A ação de apagar da nuvem é requisito do D1, quando a sincronização existir.)*

**4.3** Vincule de novo.

> ✅ 🔴 Antes de abrir o Google, um diálogo diz que vincular confirma os termos, com três opções:
> **Cancelar**, **Ler os termos**, **Vincular**.
> ✅ 🔴 Depois de vincular, "Aceito em" mostra a data **de agora**.

**4.4** **"Apagar tudo e recomeçar"** → **Continuar** → **Apagar tudo**.

> ✅ Volta para a tela de login.
> ✅ 🔴 Entrando com o Google de novo, funciona e o aceite é pedido outra vez.
