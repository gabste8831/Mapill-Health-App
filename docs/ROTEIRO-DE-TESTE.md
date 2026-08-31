# Roteiro de teste em aparelho

> **Este é o único roteiro de teste do projeto.** Ele tem duas partes, e a ordem importa:
>
> | | O que é | Quando | Tempo |
> |---|---|---|---|
> | **[Parte 1 — Integridade](#parte-1--integridade)** | O que pode estar **quebrado**: treze blocos que nunca rodaram em aparelho | **Primeiro** | ~1 h |
> | **[Parte 2 — Passada geral](#parte-2--passada-geral)** | O app inteiro, do zero, como quem nunca o abriu | Antes da defesa | ~2 h |
>
> A Parte 1 existe porque **treze blocos foram escritos entre 29 e 31/08 sem nenhuma execução em
> aparelho**. Ela não cobre o app todo de propósito: cobre o que tem chance real de estar quebrado.

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

⚠️ **Build nova, e desinstale a anterior.** Três motivos que se somam:

1. O `app.json` ganhou permissões (`POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`, `USE_EXACT_ALARM`),
   e permissão não entra por recarga do Metro.
2. Os canais de notificação subiram para **`v3`**. Um canal já criado fica **congelado** no
   aparelho: som e importância não mudam por atualização. Instalar por cima manteria o alarme mudo.
3. `expo-camera` é dependência nativa (bloco 8).

⚠️ **Aparelho físico.** Emulador não serve para os blocos 1, 2 e 3 — o que está em jogo é o
comportamento do sistema com o app fechado e sob economia de bateria.

```bash
npx expo start --dev-client
```

**Confirme em 10 segundos que é a build certa:** cadastre qualquer remédio com lembrete **Alarme**.
O Android tem que **pedir permissão de notificações** na hora. Se não pedir, a build é antiga.

---
---

# PARTE 1 — Integridade

## 1 — O alarme dispara com o app fechado 🔬

**A promessa central do app, e o maior risco técnico do projeto.** Na rodada de 29/08 ele chegou
**mudo** — a causa era um campo `sound` que fazia o Android procurar um arquivo inexistente.

**1.1** Cadastre `Teste Fechado`, dose `1`, Todo dia, 1×, horário **daqui a 3 min**, uso contínuo,
lembrete **Alarme**.

**1.2** **Feche o app completamente** (recentes, deslize para fora). Espere.

> ✅ A notificação **chega com o app fechado**.
> ✅ Aparece **por cima da tela** (heads-up), não só na barra.
> ✅ **Tem som e vibração.** ← *era isto que estava quebrado*
> ✅ Título **"Hora do seu remédio"**, corpo **`Teste Fechado: 1 comprimido`**.
> ✅ Mostra o **ícone do app**, não o triângulo genérico.
> ❌ Título `HH:MM — Teste Fechado` significa build antiga.

🔬 **Anote:** chegou no horário exato? Atrasou quanto?

**1.3** Ative o **Não Perturbe** do Android. Cadastre um com **Alarme** e outro com **Notificação**,
ambos para daqui a 3 min. Feche o app.

> ✅ O de **Notificação** chega silencioso.
> ✅ O de **Alarme** **toca mesmo com o Não Perturbe ligado**.
> ❌ Se os dois ficarem silenciosos, `bypassDnd` não funcionou — as duas opções viraram a mesma
> coisa, e o texto do app precisa mudar.

🔬 **Anote:** a diferença foi perceptível?

---

## 2 — Os botões da notificação

Aqui estavam dois defeitos de 29/08: cinco toques em "Adiar" geravam **cinco** lembretes, e o
estoque descontava 1 em vez da dose.

**2.1** Cadastre `Teste Botao`, dose **2**, daqui a 3 min, estoque **20**, Alarme. Feche o app.
Quando chegar, toque em **Tomei**.

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

---

## 3 — Nada de alarme órfão

**O pior defeito possível: lembrete de um remédio que a pessoa já parou de tomar.**

**3.1** Cadastre `Vai Sumir`, daqui a 5 min, Alarme. **Exclua o medicamento.** Feche o app.

> ✅ **A notificação NÃO chega.**

**3.2** Cadastre `Vai Mudar`, daqui a 4 min, Alarme. **Edite** para daqui a 10 min. Feche o app.

> ✅ Nada no horário antigo; chega no novo.

**3.3** Cadastre `Vai Desligar`, daqui a 4 min. Edite e **feche o popup de lembrete sem escolher
nada**. Feche o app.

> ✅ Nada chega. Não configurar já é recusar.

---

## 4 — Vários remédios no mesmo horário

**4.1** Cadastre **dois** para daqui a 4 min: `Losartana` (dose 1) e `Metformina` (dose 2), Alarme
nos dois. Feche o app.

> ✅ Chega **UMA notificação só**, não duas.
> ✅ Título **"Hora dos seus remédios (2)"**.
> ✅ Corpo com uma linha por remédio: `Losartana: 1 comprimido` / `Metformina: 2 comprimidos`.
> ✅ O botão diz **"Tomei todas"**.

**4.2** Toque no **corpo** da notificação (não nos botões).

> ✅ Abre direto na tela **"Hora do remédio"**, não na Home.
> ✅ Cada um com **Tomei** e **Pulei** próprios.

**4.3** **Tomei** só na Losartana, **Pulei** na Metformina. Vá ao estoque.

> ✅ Só a Losartana descontou. Pulada não consome.

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

**10.1 — Aviso de permissão (Home).** Desligue as notificações do Mapill nas configurações do
Android e volte à Home.

> ✅ Card **amarelo** no topo, **antes da agenda**, com **"Religar os avisos"**.
> ✅ Religando, ele **some sozinho**, sem reabrir o app.

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

## Ao terminar a Parte 1

Me manda: **(1)** as falhas com o número do passo, **(2)** as respostas dos 🔬, mesmo as que
passaram. Com isso o C1 fecha formalmente e seguimos para o
[`ROTEIRO-DE-PRINTS.md`](./ROTEIRO-DE-PRINTS.md).

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
