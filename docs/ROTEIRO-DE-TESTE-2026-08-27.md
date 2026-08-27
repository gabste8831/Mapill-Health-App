# Roteiro de teste — 27/08/2026

> Só o que **mudou** desde a sua revisão de 26/08. Os blocos que passaram sem ressalva naquele dia
> não estão aqui — o roteiro completo continua em
> [`ROTEIRO-DE-TESTE-EM-APARELHO.md`](./ROTEIRO-DE-TESTE-EM-APARELHO.md), para a validação final
> antes da defesa.
>
> **36 dos 37 achados** da revisão foram fechados. Este documento é a conferência deles.
> Tempo estimado: **35 a 45 minutos**.

## Antes de começar

**Instale a build nova.** Esta leva mexeu no `app.json` (permissão de câmera), então recarregar o
Metro não basta — só o passo 5 depende disso, mas é mais simples instalar de uma vez.

Desinstale o Mapill (dev) anterior antes: os dois têm nome e ícone iguais, e o roteiro começa
apagando os dados de qualquer forma.

```bash
npx expo start --dev-client
```

**Confirme em 3 segundos que é a versão certa:** abra a aba **Calendário**. Precisa mostrar uma
**grade de mês azul**. Se ainda for lista corrida, o JS é antigo — aperte `r` no terminal.

## Como reportar

Só o que falhar, com o número:

```
4.2 falhou — a foto continuou a mesma depois de trocar
9.1 falhou — o mês não mostrou pontinho nenhum
resto ok
```

🔴 marca o que existe para pegar um bug específico. Se um deles falhar, **avise** — o resto do
bloco costuma depender.

---

## 1 — Abrir o app (F7)

**1.1** Feche o app completamente (tire dos recentes) e abra.

> ✅ 🔴 **A tela de login não pode piscar** antes da Home. Ou vai direto para o app, ou vai direto
> para o login — nunca um lampejo de login seguido da Home.
> *(Era o F7: o app decidia a tela antes de terminar de ler o banco.)*

---

## 2 — Ficha e datas (X7, X12, E2)

**2.1** **Ajustes** → toque no bloco azul do topo (sua ficha).

**2.2** 🔴 Olhe o campo **DATA DE NASCIMENTO**.

> ✅ Existe um **ícone de calendário** à direita do campo.
> ✅ Dá para **digitar** normalmente — o campo não foi substituído.

**2.3** 🔴 Digite `29/02/2025` (2025 não é bissexto).

> ✅ O campo acusa data inválida.

**2.4** Toque no ícone de calendário e navegue até **fevereiro de 2025**.

> ✅ 🔴 O dia **29 não existe** para ser tocado.
> ✅ "Confirmar" nasce **apagado** até você tocar num dia.
> ✅ Dias **no futuro** não podem ser escolhidos — ninguém nasceu amanhã.

**2.5** Escolha uma data válida e confirme.

> ✅ O campo preenche no formato `DD/MM/AAAA`.

**2.6** Toque em **"Adicionar contato"**.

> ✅ Os campos **NOME**, **TELEFONE** e **VÍNCULO** têm respiro entre si — não estão colados.

**2.7** Feche o popup. Toque na **foto da ficha**.

> ✅ 🔴 Abre um popup perguntando de onde vem a foto: **"Tirar foto agora"** e
> **"Escolher da galeria"**.

**2.8** Escolha **"Tirar foto agora"**.

> ✅ 🔴 Pede permissão de câmera na primeira vez e **abre a câmera**.
> *(Se não abrir, a build é antiga — o `app.json` mudou nesta leva.)*

**2.9** Tire a foto e confirme.

> ✅ A foto aparece na hora no círculo.

**2.10** Salve e volte para Ajustes.

---

## 3 — Ajustes e conta (E4, P2, X13)

**3.1** 🔴 Olhe a tela de **Ajustes**.

> ✅ Ela tem só **duas** coisas: o bloco azul da ficha e uma linha **"Conta e dados"**.
> ✅ 🔴 As seções CONTA, PRIVACIDADE e MEUS DADOS **não estão mais soltas ali**.

**3.2** Toque em **"Conta e dados"**.

> ✅ Abre uma tela própria, com as três seções: **CONTA**, **PRIVACIDADE** e **MEUS DADOS**.
> ✅ A seta de voltar retorna para Ajustes.

**3.3** Toque em **"Termos e privacidade"** e olhe **"Aceito em"**.

> ✅ 🔴 Mostra a data **e o horário** (`27/08/2026 às 14:32`), não só a data.
> ✅ "Versão aceita" e "Versão atual" são **iguais**.

**3.4** Volte. Se você estiver **sem conta**, toque em **"Vincular uma conta do Google"**.
*(Se já estiver com conta, desvincule primeiro.)*

> ✅ 🔴 **Antes de abrir o Google**, aparece um diálogo dizendo que vincular confirma os termos
> (com o número da versão) e que o aceite fica registrado com a data de hoje.
> ✅ Três opções: **Cancelar**, **Ler os termos**, **Vincular**.

**3.5** Toque em **"Ler os termos"**.

> ✅ Abre a tela de termos — confirmar não pode ser assinar às cegas.

**3.6** Volte, toque em **"Vincular"** e entre com o Google.

> ✅ A conta vincula e **nenhum dado é perdido**.

**3.7** 🔴 Volte em **"Termos e privacidade"**.

> ✅ 🔴 A data de **"Aceito em"** é de **agora** — o aceite da vinculação foi registrado.
> ❌ Se continuar mostrando a data do onboarding, o registro não gravou.

---

## 4 — Cadastro: anexos e foto (X2, F3, E2)

**4.1** **Remédios** → **+** → **Cadastro manual**. Preencha o mínimo:
nome `Teste Anexos`, **Comprimido ou cápsula**, dose `1`, **Todo dia**, **1×**, horário `10:00`,
**Uso contínuo**.

**4.2** Na seção **ANEXOS**, toque no quadrado da foto da caixa e escolha **"Escolher da galeria"**.

> ✅ 🔴 A foto aparece **na hora** no quadrado.

**4.3** 🔴 Troque a foto por outra, **duas vezes seguidas**.

> ✅ 🔴 A miniatura muda **toda vez**.
> ❌ Se ficar presa na primeira, é o cache de imagem (era o F3).

**4.4** 🔴 Olhe a seção da receita, logo abaixo.

> ✅ 🔴 Existe o rótulo **RECEITA MÉDICA** acima dela.
> ✅ As opções são **"Escolher da galeria"** e **"Escolher arquivo"** — não mais "Tirar da galeria".
> ✅ 🔴 Os dois rótulos cabem lado a lado **sem quebrar no meio da palavra**.

**4.5** Toque em **"Escolher arquivo"** e escolha um **PDF**.

> ✅ Aparece ícone de PDF e o nome do arquivo.
> ✅ 🔴 Com o anexo escolhido, existem **duas** ações: **"Alterar anexo"** e **"Remover"**
> (esta em vermelho). Antes só havia remover.

**4.6** Toque em **"Alterar anexo"** e escolha outro arquivo.

> ✅ Troca sem apagar a validade que você tenha preenchido.

**4.7** Preencha **RECEITA VÁLIDA ATÉ** com uma data 60 dias à frente. Abra o calendário do campo.

> ✅ 🔴 Os dias **já passados** estão apagados — receita vencida não é aceita.

---

## 5 — Cadastro: lembrete e dicas (X3, X4, X9, X15)

**5.1** Na seção **LEMBRETE**, toque em **"Configurar lembrete"**.

> ✅ 🔴 Três opções: alarme, notificação e os dois.
> ✅ 🔴 **"Nenhum aviso" não existe mais.**

**5.2** Abra o acordeão **"Como funcionam os alertas"** e role até o fim.

> ✅ 🔴 Existe o link **"Ler os Termos de Uso completos"**, sublinhado.

**5.3** Toque no link.

> ✅ Abre os termos. Voltar devolve ao cadastro **com tudo preenchido**.

**5.4** 🔴 Feche o popup de lembrete **sem escolher nada** e salve o medicamento.

> ✅ Salva normalmente — não configurar já é recusar.

---

## 6 — Unidades e dicas (X4, X1)

**6.1** Novo cadastro manual. Nome `Xarope`, **COMO VOCÊ TOMA?** → **"Líquido (xarope, solução)"**.

> ✅ Aparece **"COMO A DOSE É MEDIDA?"** com ml, mg e g.
> ✅ 🔴 A dica sobre o copinho vem num **bloco próprio**, com ícone de **`?`** e fundo alaranjado —
> não mais um texto cinza igual ao resto.

**6.2** Escolha **ml**, dose `7,5`, **Todo dia**, **2×**, e toque em **"Definir horários"**.

**6.3** 🔴 Toque na caixa da **1ª DOSE**.

> ✅ 🔴 Abrem **dois campos numéricos grandes** — hora e minuto. **Não** o mostrador redondo.
> ✅ 🔴 É **24 horas**: digitar `20` dá 20:00, sem AM/PM.
> ✅ As cores são as do app (azul), **não** o verde do sistema.
> ✅ Há um ícone de relógio no canto que alterna para o mostrador, para quem preferir.

**6.4** Defina `08:00` e `20:00`. Olhe o botão **"Cancelar"** no popup.

> ✅ 🔴 Ele tem **contorno visível** — não é mais um texto solto ao lado do Confirmar.

**6.5** Toque em **"Pronto"**.

> ✅ 🔴 O **teclado fecha junto** com o popup.
> *(Era o F6: o popup fechava e o teclado ficava.)*

**6.6** Complete com **Uso contínuo** e salve.

---

## 7 — Dose variável e série (E7, F4)

**7.1** Novo cadastro. Nome `Insulina`, **Injeção**, unidade **UI**, dose `10`, **Todo dia**, **2×**.

**7.2** 🔴 Olhe **logo abaixo do campo de dose**.

> ✅ 🔴 Existe o checkbox **"A dose muda de um horário para o outro"** — ali, junto da dose.
> ✅ Ele **não** está mais escondido dentro do popup de horários.

**7.3** Marque o checkbox e abra **"Definir horários"**.

> ✅ Há um campo de quantidade em **cada** horário.

**7.4** Defina `08:00` com dose `10` e `22:00` com dose `8`. Toque em **"Pronto"**.

> ✅ 🔴 As fichinhas mostram **`08:00 · 10`** e **`22:00 · 8`**.

**7.5** Reabra os horários e toque em **"Preencher de X em X horas"**.

> ✅ 🔴 Há uma frase dizendo que **as doses por horário são mantidas** — a série só recalcula as
> horas.
> *(Era o F4: parecia que a série apagava a dose.)*

**7.6** Cancele, complete com **Uso contínuo**, estoque `300` UI e salve.

---

## 8 — Listas e estoque (X10, X6, E3, X5)

**8.1** Vá na aba **Remédios**.

> ✅ 🔴 O card da **Insulina** mostra **`08:00 · 10 UI`** e **`22:00 · 8 UI`** nas fichinhas —
> a dose junto da hora, porque ela varia.

**8.2** 🔴 Role a lista para baixo.

> ✅ 🔴 O texto "Abaixo, suas medicações..." **rola junto** e sai da tela.
> ✅ 🔴 A **busca continua fixa** no topo.

**8.3** 🔴 Olhe a fileira de ordenação abaixo da busca.

> ✅ Três fichas: **A–Z**, **Mais recentes**, **Acabando**. Uma sempre marcada.
> ✅ "Mais recentes" traz o último cadastrado para o topo.
> ✅ "Acabando" põe na frente quem tem menos estoque e **empurra para o fim** quem não controla.

**8.4** 🔴 Olhe o topo da tela, ao lado do título "Medicações".

> ✅ 🔴 **Não existe mais ícone de caixa ali** — ele saiu.

**8.5** 🔴 Role até o texto de apoio, logo acima da lista.

> ✅ 🔴 Existe o botão **"Gerenciar estoques dos medicamentos"**.

**8.6** Vá na **Home**.

> ✅ 🔴 Existe um card **"Estoque"** dizendo quantas medicações são controladas.

**8.7** Toque nele.

> ✅ Abre a tela de Estoque.
> ✅ 🔴 Fileira de ordenação com **Acaba primeiro**, **Menos na caixa** e **A–Z**.

**8.8** 🔴 Olhe a previsão da **Insulina**.

> ✅ 🔴 Diz **16 ou 17 dias** — nunca 15.
> *(10 + 8 = 18 UI por dia, não 2 × 10 = 20.)*

**8.9** 🔴 Cadastre um remédio em **Gotas** (dose `20` gotas, "Só quando precisar", estoque `20` ml)
e volte ao Estoque.

> ✅ 🔴 Ele diz **"Sem previsão de término"**.
> ❌ Se disser um número de dias, é o bug de unidade — estoque em ml e dose em gotas não se
> dividem sem a concentração do frasco.

---

## 9 — Calendário novo (E1)

**9.1** 🔴 Vá na aba **Calendário**.

> ✅ 🔴 No topo, uma **grade do mês** azul, com os dias da semana e os números.
> ✅ **Hoje** tem contorno branco; o **dia selecionado** tem círculo branco preenchido.
> ✅ 🔴 Dias com algo marcado têm **pontinhos** embaixo do número.
> ✅ Abaixo, a fileira de filtros: **Tudo**, **Compromissos**, **Remédios**.
> ✅ Abaixo dela, o que existe **no dia selecionado**.

**9.2** Toque num dia que tem pontinho.

> ✅ O círculo branco se move, e a lista abaixo troca para aquele dia.

**9.3** Toque num dia **vazio**.

> ✅ Diz **"Nada marcado para este dia."** — não fica com a lista do dia anterior.

**9.4** 🔴 Toque em **"Compromissos"** no filtro.

> ✅ 🔴 Os pontinhos de dose **somem da grade** e a lista mostra só consultas.

**9.5** Toque em **"Remédios"**.

> ✅ O inverso: só doses, na grade e na lista.

**9.6** 🔴 Toque na seta de **próximo mês**, duas vezes.

> ✅ A grade avança e a seleção vai para o **dia 1º** do mês visitado.
> ✅ 🔴 As doses **continuam aparecendo** dois meses à frente (são projetadas).
> ✅ Voltando ao mês corrente, a seleção retorna para **hoje**.

---

## 10 — Compromisso no passado (E8, X8)

**10.1** **Calendário** → **+** → **"Cadastrar um compromisso"**. Descrição
`Consulta que já foi`.

**10.2** 🔴 Em **DATA**, digite uma data **de ontem**.

> ✅ 🔴 **Não trava.** Aparece o aviso: *"Esse compromisso já passou. Ele entra na agenda como
> registro, e não haverá lembrete — você poderá anotar o que aconteceu."*
> ✅ 🔴 A seção **LEMBRETES some por completo**.
> ✅ O botão de salvar **acende**.

**10.3** Defina um horário e salve.

> ✅ Aparece no calendário, no dia de ontem.

**10.4** 🔴 No card dele, procure a pergunta **"Você foi?"**.

> ✅ Está lá, com **Fui** e **Não fui**.

**10.5** Novo compromisso, agora para **3 dias à frente**. Responda **"Sim"** para ser lembrado,
**"Sim"** para os dois canais.

**10.6** 🔴 Olhe a seção de antecedência.

> ✅ 🔴 O rótulo é **"COM QUANTOS DIAS DE ANTECEDÊNCIA"**.
> ✅ 🔴 O campo livre **"OUTRO PRAZO, EM DIAS"** está em **linha própria**, com largura de verdade —
> não espremido ao lado das fichas.

**10.7** Digite `15` no campo livre.

> ✅ O atalho selecionado desmarca.
> ✅ Avisa que a antecedência já passou (15 dias > 3 dias).
> ✅ Digitar `0` ou `999` dá erro pedindo entre 1 e 180 dias.

**10.8** Volte para **1 dia antes** e salve.

---

## 11 — Doses de hoje e E10 (F1, E10)

**Faça este bloco quando já tiver passado de algum horário do dia** — de tarde ou à noite.

**11.1** Novo cadastro manual. Nome `Teste Doses`, comprimido, dose `2`, **Todo dia**, **3×**,
com horários **que já passaram hoje** (ex: `06:00`, `07:00`, `08:00`), **Uso contínuo**,
estoque `20`.

**11.2** 🔴 **Antes de salvar**, olhe abaixo dos horários.

> ✅ 🔴 O app **avisa** quais horários de hoje já passaram e não serão agendados, e diz que amanhã
> o dia entra normal.
> ✅ 🔴 Abaixo, a pergunta **"VOCÊ JÁ TOMOU ALGUMA DELAS HOJE?"**, com uma ficha por horário.
> ✅ Nada vem marcado.

**11.3** 🔴 Marque **um** horário e leia a frase abaixo.

> ✅ 🔴 Diz que **1 dose entra no histórico de hoje** e que **o estoque não muda** — porque o
> número que você informou já é o que tem na caixa agora.
> ❌ Se disser que o estoque desconta, é a versão antiga.

**11.4** Salve.

**11.5** 🔴 Vá em **Remédios** → **Estoque** e olhe o `Teste Doses`.

> ✅ 🔴 O estoque está em **20** — exatamente o que você digitou, intacto.

**11.6** 🔴 Vá na **Home**.

> ✅ 🔴 A dose que você marcou aparece como **já confirmada** hoje.

---

## 12 — Itens que ficaram bloqueados em 26/08

Estes falharam na sua revisão por causa do F1, que já foi corrigido. **Exigem método novo.**

**12.1** 🔴 Cadastre um remédio com horário **para daqui a 2 ou 3 minutos** (não um horário
passado — esse nunca gera dose atrasada, e é o comportamento correto). Dose `2`, estoque `20`.

**12.2** Espere o horário passar e vá na **Home**.

> ✅ 🔴 A dose aparece como **atrasada**, em vermelho.

**12.3** Repita para ter **duas** doses atrasadas. Toque em **"Confirmar todas"**.

> ✅ 🔴 O diálogo **lista os nomes de cada dose**, com quantidade e horário — não só "2 doses".

**12.4** Confirme e vá ao **Estoque**.

> ✅ 🔴 O estoque caiu **pela dose** (2 por dose), não por 1 por dose.

**12.5** 🔴 Deixe um estoque perto de acabar (recontagem para `4`, por exemplo, num remédio de
2 por dia) e vá na **Home**.

> ✅ O card **"Alerta de estoque"** aparece, com **um** botão: **"Abrir estoque"**.
> ✅ Ele leva para a tela de Estoque, e não para o cadastro do remédio.

---

## 13 — Apagamento (fecha o ciclo)

**13.1** **Ajustes** → **Conta e dados** → **MEUS DADOS** → **"Apagar meus dados de saúde"**.

> ✅ O diálogo diz o que some e o que fica.

**13.2** Confirme.

> ✅ O app continua aberto, com sua ficha intacta.
> ✅ 🔴 Na **Home** e em **Remédios**, o acesso ao estoque **some** — sem estoque cadastrado, ele
> levaria a uma tela vazia.

**13.3** **"Apagar tudo e recomeçar"** → **Continuar** → **Apagar tudo**.

> ✅ Volta para a tela de login.

**13.4** 🔴 Entre **com o Google**.

> ✅ Funciona, e o aceite dos termos é pedido de novo.

---

## Se algo falhar

Me manda a lista com o número do passo e o que apareceu. Eu corrijo, você recarrega o Metro
(`r` no terminal) e reconfere só aquele passo — sem precisar refazer o roteiro.

O que passar eu marco na §6.2 do plano, e aí abrimos o **C1 (notificações)**.
