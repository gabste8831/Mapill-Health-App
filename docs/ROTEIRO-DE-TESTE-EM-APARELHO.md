# Roteiro de teste em aparelho — 2026-08-25

> Guia operacional passo a passo: onde tocar, o que preencher, o que precisa acontecer.
> É a forma executável da fila de validação (§6.2 do `PLANO-DE-DESENVOLVIMENTO.md`).
> Ao terminar, basta reportar **número do passo + passou/falhou**, e o que apareceu quando falhou.
>
> Feito para ser percorrido **na ordem**: os cadastros do começo alimentam os testes do meio, e o
> apagamento do fim destrói tudo. Ordem dos blocos: **A, B, C, D, E, F, I, H, G**.

## Antes de começar

**Não precisa de build novo.** Nada de dependência nativa mudou desde o build de 22/08 — só JS/TS.

```bash
npx expo start --dev-client
```

Abrir o **Mapill (dev)** no aparelho. Tempo total estimado: 25 a 35 minutos.

### De onde vem o login com Google

O `.env` **não sobe para o EAS** (está no `.easignore`), então até 25/08 qualquer build
`preview`/`production` saía com as credenciais do Supabase vazias e o login nascia indisponível —
foi o que aconteceu na build de 25/08. Resolvido cadastrando as variáveis no **servidor do EAS**,
que é onde credencial de build mora; no repositório, nunca.

| Build | De onde vem o JS | De onde vêm as credenciais |
|---|---|---|
| `development` + `npx expo start --dev-client` | Metro da sua máquina | `.env` local |
| `preview` / `production` | bundle gerado no servidor do EAS | variáveis de ambiente do EAS |

Cadastradas em 25/08 nos três ambientes (`development`, `preview` e `production`):
`EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Conferir com
`eas env:list --environment preview`. Se um dia o login voltar a dizer "indisponível nesta versão",
é aqui que se olha primeiro.

⚠️ **Se o passo 2.4 falhar (o relógio não aparecer), pare e avise.** Os roteiros B, C e D dependem
todos do mesmo popup, e não adianta percorrê-los.

---

## Roteiro A — Primeira abertura

Cobre os itens 9 e 2 da §6.2.

**A.1** Abrir o app.

> ✅ **Deve ir direto para o aceite dos termos**, sem passar pela tela de login — você já tem ficha
> preenchida, e a primeira execução não recomeça por causa disso. O aceite aparece porque
> `CURRENT_TERMS_VERSION` subiu para `1.1.0`.
> ❌ Se pedir login antes, a correção de 25/08 não pegou.
> ❌ Se entrar direto no app sem pedir o aceite, o reconsentimento não está pegando.

**A.1b** 🔴 Depois de aceitar e chegar no app, **fechar o app completamente** (tirar dos recentes)
e abrir de novo.

> ✅ Deve abrir **direto na Home**. Sem tela de login, sem termos, sem ficha.
> ❌ Se voltar para o login, é o bug que estava lá antes de 25/08: o app só pulava a primeira
> execução quando havia sessão do Google, então quem seguia sem conta revia essa tela todo dia.

**A.2** Ainda na tela de consentimento, ler o destaque com o ícone de nuvem.

> ✅ Deve dizer **"Cópia em nuvem, opcional e ainda indisponível"** e afirmar que hoje os dados
> ficam só no aparelho. Não pode prometer backup.

**A.3** Aceitar os termos e entrar no app.

> ✅ Sua ficha de saúde e seus medicamentos anteriores devem continuar lá. O reconsentimento não
> apaga nada.

**A.4** Ir na aba **Ajustes** (última da barra) e olhar a seção **CONTA**.

> ✅ Se estiver logado: deve dizer "Desvincular esta conta" com o seu e-mail. Se não: "Vincular uma
> conta do Google", com a frase "A cópia na nuvem ainda não está disponível".
> ❌ Se disser que o login está indisponível nesta versão, o build saiu sem as credenciais — ver
> "Antes de começar".
> ✅ Abaixo do cartão: "Seus dados ficam neste aparelho".

**A.5** Ainda em Ajustes, conferir que existe a seção **MEUS DADOS**, com dois itens em vermelho:
"Apagar meus dados de saúde" e "Apagar tudo e recomeçar". **Não toque neles agora** — são o
Roteiro G.

---

## Roteiro B — Cadastro de rotina, com o relógio nativo

Cobre o item 4 da §6.2 (**o de maior risco**).

**B.1** Ir na aba **Home** (primeira da barra) e tocar no botão **+** azul, no canto inferior direito.

**B.2** Tocar em **"Cadastrar uma medicação"**.

**B.3** Tocar em **"Cadastro manual"**.

**B.4** No campo **NOME DA MEDICAÇÃO**, digitar: `Losartana 50mg`

**B.5** Em **COMO VOCÊ TOMA?**, tocar em **"Comprimido ou cápsula"**.

> ✅ Deve aparecer um selo dizendo que a dose é medida em comprimido — sem perguntar a unidade.
> A forma resolve isso sozinha.

**B.6** Em **QUANTOS COMPRIMIDOS DE CADA VEZ**, digitar: `1`

**B.7** Em **QUAL A FREQUÊNCIA?**, tocar em **"Todo dia"**.

**B.8** Em **QUANTAS VEZES POR DIA?**, tocar em **2×**.

**B.9** Em **EM QUE HORÁRIOS?**, tocar no botão **"Definir horários"**.

**B.10** No popup que abrir, tocar na caixa da **1ª DOSE** (mostra `--:--`).

> ✅ 🔴 **O TESTE CRÍTICO**: a **roda do relógio** deve aparecer no lugar da lista.
> ❌ Se não aparecer nada, ou aparecer um espaço em branco: **pare aqui e me avise**. É componente
> Compose dentro de um `Modal`, que no Android abre em outra janela — é exatamente o risco que
> este passo existe para medir.

**B.11** Sem girar nada ainda, olhar o botão **"Confirmar"**.

> ✅ Deve estar **apagado/desabilitado**. A posição em que a roda abriu é ponto de partida, não
> resposta.

**B.12** Girar a roda até **08:00** e tocar em **Confirmar**.

> ✅ O botão acende ao girar, e ao confirmar você volta para a lista com `08:00` na 1ª dose.

**B.13** Tocar na caixa da **2ª DOSE**, girar até **20:00**, confirmar.

**B.14** *(opcional, se quiser testar a digitação)* Abrir um horário de novo e tocar no ícone de
teclado que o próprio relógio oferece, no canto.

> ✅ Deve alternar para digitação nativa e voltar.

**B.15** Tocar em **"Pronto"** para fechar o popup.

> ✅ Na tela, duas fichinhas cinza: `08:00` e `20:00`.

**B.16** Em **QUANDO COMEÇA**, conferir que diz **"Hoje"** com um link "Alterar" ao lado.
Não alterar agora.

**B.17** Em **QUAL O TEMPO DO TRATAMENTO?**, tocar em **"Uso contínuo"**.

> ✅ Agora deve aparecer o aviso **"Seu medicamento já pode ser cadastrado!"** e, abaixo dele, as
> seções opcionais (ESTOQUE, ANEXOS, LEMBRETE, INFORMAÇÕES ADICIONAIS). O botão do rodapé acende
> no mesmo instante.

**B.18** Na seção **ESTOQUE**, tocar em **"Controlar meu estoque"**.

**B.19** No popup, em **QUANTOS COMPRIMIDOS VOCÊ TEM**, digitar `30`.
Em **ONDE VOCÊ GUARDA**, digitar `Gaveta da cozinha`.
Marcar **"Me avisar quando estiver acabando"** e escolher **7 dias**.

> ✅ Deve aparecer uma frase estimando até quando o estoque dura (30 comprimidos, 2 por dia = 15 dias).

**B.20** Tocar em **"Pronto"** e depois no botão de salvar, no rodapé.

> ✅ Deve aparecer uma confirmação de tela cheia e, depois de ~3 segundos, levar você para a
> **lista de medicações** com a Losartana lá.

---

## Roteiro C — Antibiótico de 8 em 8 horas

Cobre o item 5 da §6.2 (preenchimento em série) e prepara o item 8 (estoque).

**C.1** Na aba **Remédios**, tocar no **+** (ou voltar para a Home e usar o FAB). Repetir
B.2 e B.3 para chegar no cadastro manual.

**C.2** **NOME DA MEDICAÇÃO**: `Amoxicilina 500mg`

**C.3** **COMO VOCÊ TOMA?** → **"Comprimido ou cápsula"**

**C.4** **QUANTOS COMPRIMIDOS DE CADA VEZ**: `2`
*(dois de propósito — é o que prova, no Roteiro F, que o estoque desconta a dose e não uma unidade)*

**C.5** **QUAL A FREQUÊNCIA?** → **"Todo dia"**

**C.6** **QUANTAS VEZES POR DIA?** → **3×**

**C.7** **EM QUE HORÁRIOS?** → **"Definir horários"**

**C.8** No popup, **sem preencher nada**, tocar em **"Preencher de X em X horas"** (fica abaixo
dos três campos).

**C.9** Em **DE QUANTAS EM QUANTAS HORAS (3 doses)**, digitar `8`.

**C.10** Tocar em **PRIMEIRO HORÁRIO** e escolher **06:00** na roda. Confirmar.

> ✅ Deve aparecer o bloco **FICARIA ASSIM** com três fichinhas: `06:00`, `14:00`, `22:00`.

**C.11** Tocar em **"Preencher"**.

> ✅ Volta para a lista com os três horários preenchidos.

**C.12** 🔴 **Testar o bloqueio.** Tocar de novo em "Preencher de X em X horas" e digitar `12`
como intervalo.

> ✅ Deve aparecer um **erro em vermelho** dizendo que 3 doses de 12 em 12 horas passam de um dia
> e alguma cairia em cima da outra. O botão "Preencher" deve ficar apagado.
> *(3 × 12 = 36 horas, mais que as 24 do dia)*

**C.13** Tocar em **"Cancelar"** e depois em **"Pronto"**.

> ✅ Os horários `06:00`, `14:00`, `22:00` continuam lá — cancelar não desfez o que já valia.

**C.14** **QUAL O TEMPO DO TRATAMENTO?** → **"Tem prazo"** → **QUANTO TEMPO DURA**: `7` →
unidade **"dias"**.

> ✅ Deve aparecer uma linha dizendo de quando até quando, e **quantas doses** o tratamento tem no
> total.

**C.15** Na seção **ESTOQUE** → **"Controlar meu estoque"** → **QUANTOS COMPRIMIDOS VOCÊ TEM**: `20`
→ **Pronto**.

> ✅ Deve aparecer um **aviso em cor de atenção**: o tratamento inteiro consome 42 comprimidos
> (3 doses × 2 comprimidos × 7 dias) e você tem 20.

**C.16** Salvar.

---

## Roteiro D — Tratamento que começa depois

Cobre o item 6 da §6.2.

**D.1** Novo cadastro manual.

**D.2** **NOME**: `Vitamina D` · **COMO VOCÊ TOMA?** → **"Comprimido ou cápsula"** ·
**QUANTOS COMPRIMIDOS DE CADA VEZ**: `1`

**D.3** **QUAL A FREQUÊNCIA?** → **"Todo dia"** · **QUANTAS VEZES POR DIA?** → **1×** ·
**EM QUE HORÁRIOS?** → definir **09:00**.

**D.4** Em **QUANDO COMEÇA**, tocar em **"Alterar"**.

> ✅ A linha "Hoje" deve virar um campo de data vazio, com placeholder `DD/MM/AAAA`.

**D.5** 🔴 **Testar a data pela metade.** Digitar só `27/0` e olhar o rodapé.

> ✅ O botão de salvar deve estar **apagado**, e o rodapé deve dizer que falta **"a data de início"**.
> Data incompleta não pode virar "hoje" por omissão.

**D.6** Completar a data para **3 dias à frente** (ex: se hoje é 24/08/2026, digitar `27/08/2026`).

**D.7** **QUAL O TEMPO DO TRATAMENTO?** → **"Uso contínuo"**. Salvar.

**D.8** Ir na aba **Home**.

> ✅ 🔴 A Vitamina D **NÃO** pode aparecer na agenda de hoje. Se aparecer, a data de início não
> está recortando a geração de horários.

---

## Roteiro E — Aba Remédios

Cobre o item 3 da §6.2.

**E.1** Ir na aba **Remédios**.

> ✅ Devem estar lá os três cadastros: Losartana, Amoxicilina e Vitamina D, cada um com dose,
> frequência, horários e estoque.

**E.2** Na busca (campo em formato de pílula com lupa), digitar `losart` — **sem acento e em
minúsculas**.

> ✅ Deve achar a Losartana. O contador deve virar **"1 de 3"**.

**E.3** Apagar a busca e digitar `amoxi`.

> ✅ Deve achar a Amoxicilina.

**E.4** Digitar algo que não existe, como `xyz`.

> ✅ Deve aparecer um estado vazio dizendo que **não achou com esse termo** — diferente de
> "não tem nada cadastrado".

**E.5** Limpar a busca. Tocar no ícone de **lápis** da Losartana.

> ✅ Deve abrir o formulário **já preenchido**: nome, forma, dose 1, todo dia, 2×, horários 08:00
> e 20:00, uso contínuo, estoque 30, "Gaveta da cozinha".

**E.6** Sem mudar nada, voltar (seta do topo ou botão físico de voltar).

> ✅ 🔴 O botão **físico** de voltar deve fechar o formulário e devolver para a lista — não fechar
> o app.

**E.7** Tocar no ícone de **lixeira** da Vitamina D.

> ✅ Deve pedir confirmação explicando **o que some** (os horários futuros) e **o que fica**
> (o histórico de ingestão).

**E.8** Confirmar a exclusão.

> ✅ A Vitamina D some da lista, e o contador cai para 2.

**E.9** 🔴 Conferir o botão **+** no canto inferior direito desta aba.

> ✅ Ele deve existir, e tocar nele deve abrir **direto** "Escanear código de barras | Cadastro
> manual" — sem passar pela pergunta "medicação ou compromisso?".

---

## Roteiro F — Home, doses atrasadas e estoque

Cobre os itens 7 e 8 da §6.2. **Faça este roteiro à noite**, para que os horários já tenham passado.

**F.1** Novo cadastro manual, para forçar doses atrasadas:
**NOME**: `Teste Atrasadas` · **COMO VOCÊ TOMA?** → **"Comprimido ou cápsula"** ·
**QUANTOS COMPRIMIDOS DE CADA VEZ**: `2`

**F.2** **QUAL A FREQUÊNCIA?** → **"Todo dia"** · **QUANTAS VEZES POR DIA?** → **3×**

**F.3** **EM QUE HORÁRIOS?** → definir três horários **que já passaram hoje**: `06:00`, `07:00`
e `08:00`.

**F.4** **QUAL O TEMPO DO TRATAMENTO?** → **"Uso contínuo"**.

**F.5** **ESTOQUE** → "Controlar meu estoque" → **QUANTOS COMPRIMIDOS VOCÊ TEM**: `20` → Pronto.
Salvar.

**F.6** Ir na aba **Home**.

> ✅ No topo, um bloco em vermelho dizendo **"3 doses atrasadas"** (mais as da Losartana e da
> Amoxicilina que já passaram, se for o caso).
> ✅ Ao lado do título, o link **"Confirmar todas"**.

**F.7** Tocar em **"Confirmar todas"**.

> ✅ 🔴 O diálogo deve **listar os nomes de cada dose**, uma por linha, com a quantidade e o
> horário — não só "3 doses". E deve avisar que o estoque de cada uma será descontado.

**F.8** Confirmar.

> ✅ Todas as atrasadas ficam marcadas como confirmadas de uma vez. O progresso diário sobe.

**F.9** 🔴 **Conferir a conta do estoque.** Ir em **Remédios** e olhar o `Teste Atrasadas`.

> ✅ O estoque deve estar em **14**, não em 17.
> *(20 iniciais − 3 doses × 2 comprimidos = 14. Se der 17, o app está descontando uma unidade por
> dose em vez da dose inteira.)*

**F.10** Voltar para a **Home** e conferir uma dose que **ainda não chegou** (a Losartana das 20:00,
por exemplo, se ainda não passou).

> ✅ Ela **não** pode ter botões de confirmar/pular. Só a próxima e as atrasadas têm ação — o app
> não convida a marcar o que ainda não aconteceu.

**F.11** Tocar numa dose **já confirmada**.

> ✅ Deve abrir a troca de desfecho, oferecendo "Não tomei", e avisando que corrigir devolve a
> quantidade ao estoque.

**F.12** *(opcional)* Confirmar a correção e conferir em Remédios que o estoque **subiu 2**.

---

## Roteiro I — Estoque (novo em 25/08)

Cobre os itens 15, 16 e 17 da §6.2. **Depende do Roteiro F**, que deixou o `Teste Atrasadas` com
estoque em 14.

**I.1** Ir na aba **Remédios** e tocar no **ícone de caixa** no canto superior direito, ao lado do
título "Medicações".

> ✅ 🔴 Abre a tela **Estoque**. Se o ícone não estiver lá, o resto do roteiro não roda.

**I.2** Olhar a lista.

> ✅ Só aparecem os remédios em que você ativou "Controlar meu estoque" — `Teste Atrasadas`,
> `Losartana` e `Amoxicilina`, conforme o que você preencheu nos roteiros B, C e F.
> ✅ O que acaba primeiro está **em cima**.
> ✅ Cada cartão traz a quantidade à direita e, abaixo, **"Acaba em N dias · 12 de set"**.

**I.3** 🔴 Conferir a previsão da **Amoxicilina** (a de 8 em 8 horas, do Roteiro C).

> ✅ Deve dizer **"Acaba em 3 dias"**.
> *(20 comprimidos, 3 doses por dia de 2 comprimidos cada = 6 por dia. O quarto dia começa e o
> estoque termina nele.)*
> ❌ Se disser 6 ou 7 dias, o app está contando 1 comprimido por dose em vez da dose cadastrada.

**I.4** No `Teste Atrasadas`, tocar em **"Recontar"**.

> ✅ O popup diz **"Hoje o app conta 14 comprimidos"**, e o campo **QUANTO VOCÊ TEM AGORA** está
> **vazio** — nunca pré-preenchido.
> ✅ O botão **Confirmar** está **apagado** enquanto nada foi digitado.

**I.5** Digitar `11` e olhar a frase acima do botão, **sem confirmar ainda**.

> ✅ 🔴 Deve dizer **"Diferença de 3 a menos, registrada como recontagem"** — e não "o estoque passa
> a ser 11". É a diferença que é gravada, e a tela precisa dizer isso.

**I.6** Apagar e digitar `14` (o mesmo número que já estava).

> ✅ A frase vira **"É exatamente o que o app já conta — nada muda"**, e o **Confirmar apaga de
> novo**. Recontar e achar o mesmo número não é um acontecimento.

**I.7** Voltar para `11` e **Confirmar**.

> ✅ O popup fecha e o cartão passa a mostrar **11 comprimidos**.

**I.8** Tocar em **"Repor"** no mesmo remédio. Digitar `30`.

> ✅ A frase diz **"O estoque passa para 41 comprimidos"** — soma, não substitui.

**I.9** Confirmar.

> ✅ O cartão mostra **41**, e a previsão de "acaba em N dias" **aumentou**.

**I.10** 🔴 Voltar para a **Home** e confirmar **qualquer dose ainda pendente** (a Losartana das
20:00 serve, se já passou). Anote de qual remédio foi.

> ✅ Voltando ao **Estoque**, a quantidade daquele remédio caiu **pela dose cadastrada**, não por 1.
> ✅ Se foi o `Teste Atrasadas` (2 por dose), ele sai de 41 para **39** — o desconto parte do saldo
> novo, e não do que existia antes da recontagem.
> *(Depois do Roteiro F as três doses do `Teste Atrasadas` já foram confirmadas. Se não sobrar
> nenhuma pendente hoje, pule este passo.)*

**I.11** Voltar ao **Estoque**, abrir **"Recontar"** no `Teste Atrasadas` e digitar um número com
vírgula, como `20,5`.

> ✅ A vírgula **entra** — meio comprimido existe, e o estoque tem que conseguir descrevê-lo.
> ✅ A prévia mostra a diferença **com a casa decimal**, e não arredondada.
> *(O bloqueio de fração vale para gota, adesivo e sachê, que não se partem ao meio. Comprimido,
> ml, mg, g e UI aceitam.)*
> Fechar o popup **sem confirmar**.

**I.12** Descer até o fim da lista.

> ✅ Existe um bloco cinza **"Falta alguma medicação nesta lista?"** explicando que o controle é
> opcional, com o botão **"Ver minhas medicações"**.

**I.13** Tocar em **"Ver minhas medicações"**.

> ✅ Volta para a aba Remédios.

**I.14** Ir na aba **Home** e procurar o card **"Alerta de estoque"** (aparece se algum remédio
estiver perto de acabar; se não houver nenhum, pule).

> ✅ Só existe **um** botão, **"Abrir estoque"** — o antigo "Ignorar lembrete" saiu, porque não
> ignorava nada.
> ✅ Tocar nele leva para a tela de Estoque, e **não** para o cadastro do remédio.

---

## Roteiro H — Compromissos (novo em 24/08)

Aba Calendário e cadastro de compromisso. **Faça antes do Roteiro G**, que apaga tudo.

**H.1** Ir na aba **Calendário** e tocar no **+** do canto inferior direito.

> ✅ 🔴 O botão deve existir nesta aba, e abrir a escolha completa: **"Cadastrar uma medicação"** e
> **"Cadastrar um compromisso"** — aqui cabem os dois.

Tocar em **"Cadastrar um compromisso"**.

**H.2** Em **DESCRIÇÃO DO COMPROMISSO**, digitar: `Consulta com cardiologista`

> ✅ É campo de texto livre, não lista de opções.

**H.3** Em **DATA**, digitar uma data **3 dias à frente**. Em **HORÁRIO**, tocar no campo.

> ✅ Deve abrir a mesma roda de relógio do cadastro de medicamento, e "Confirmar" só acende depois
> de girar.

**H.4** Escolher **14:30** e confirmar.

> ✅ Deve aparecer, abaixo dos campos, a confirmação por extenso com o **dia da semana**:
> "Sexta-feira, 27 de agosto, às 14:30" (ou o dia que for).

**H.5** 🔴 **Testar a data que já passou.** Voltar no campo DATA e digitar uma data de ontem.

> ✅ Deve dar erro **"Essa data já passou."** e travar o botão de salvar.

**H.6** Voltar a data para 3 dias à frente. Preencher **LOCAL DE ATENDIMENTO**:
`Clínica São José, sala 12` e **NOME DO PROFISSIONAL**: `Dra. Ana Martins, cardiologista`. Em
**ORIENTAÇÕES E PREPARO**: `levar exames antigos`.

**H.7** Em **DESEJA SER LEMBRADO DESTE COMPROMISSO?**, tocar em **"Não"**.

> ✅ 🔴 A opção "Não" deve **ficar marcada**. Se voltar ao cinza de não respondida, o seletor
> perdeu a resposta.
> ✅ As perguntas de baixo não devem aparecer.

**H.8** Tocar em **"Sim"**.

> ✅ Devem aparecer **duas** perguntas: "LEMBRAR NO DIA DO COMPROMISSO?" e "LEMBRAR COM
> ANTECEDÊNCIA?".

**H.9** 🔴 Responder **"Não"** para as duas.

> ✅ O botão de salvar deve travar, e o rodapé dizer que falta **"ao menos um dos dois lembretes"** —
> dizer não para os dois é o mesmo que não querer aviso.

**H.10** Responder **"Sim"** para "LEMBRAR NO DIA" e **"Sim"** para "COM ANTECEDÊNCIA".
Escolher **7 dias antes**.

> ✅ 🔴 Deve avisar em cor de atenção que **essa antecedência já passou** — a consulta é em 3 dias,
> e o aviso de 7 dias antes cairia numa data anterior a hoje.

**H.11** Trocar para **1 dia antes**.

> ✅ Deve mostrar a **data em que o aviso chega**, por extenso.
> ✅ Abaixo, deve dizer que a escolha fica salva mas que os lembretes ainda estão sendo
> desenvolvidos. *(Intencional: o disparo depende do C1.)*

**H.12** 🔴 **Testar a antecedência livre.** No campo **"Outro"**, no fim da fileira, digitar `15`.

> ✅ O atalho selecionado deve desmarcar, e o campo livre ficar destacado.
> ✅ Deve voltar a avisar que a antecedência já passou (15 dias > 3 dias).
> ✅ Digitar `0` ou `999` deve dar erro pedindo entre 1 e 180 dias.

**H.13** Voltar para **1 dia antes** e salvar.

> ✅ Confirmação de tela cheia e, depois, a aba **Calendário** com o compromisso lá.

**H.14** Conferir o card na agenda.

> ✅ Agrupado sob o dia (ex: "Sexta-feira, 27 de agosto"), com a hora à esquerda, a descrição que
> você digitou, o nome da profissional, o local, o preparo, e no rodapé **"Lembrar 1 dia antes e
> no dia"**.

**H.15** 🔴 **Conferir as doses no calendário.** Rolar a agenda até "Hoje" e os próximos dias.

> ✅ Os horários dos remédios cadastrados nos roteiros B e C devem aparecer **no mesmo dia** dos
> compromissos, num bloco com hora, nome e quantidade.
> ✅ Rolar até um dia **além de 30 dias à frente**: as doses devem continuar aparecendo (são
> projetadas). Se sumirem, a projeção falhou.

**H.16** 🔴 Numa dose de **hoje** que ainda não foi respondida, tocar no **✓**.

> ✅ Deve confirmar na hora e a linha ficar mais apagada, com o ✓ verde/azul.
> ✅ Conferir na **Home** que a mesma dose aparece confirmada — é o mesmo registro.

**H.17** Conferir uma dose de um dia **futuro**.

> ✅ 🔴 Ela **não** pode ter botões de ✓ e ✗. Só hoje e dias passados aceitam resposta.

**H.18** Cadastrar um segundo compromisso para **hoje, num horário que já passou** (ex: 08:00 se
já for noite), descrição `Coleta de sangue`.

> ✅ Deve aparecer agrupado sob **"Hoje"**, junto das doses do dia.

**H.19** 🔴 Nesse compromisso que já passou, conferir a pergunta **"Você foi?"** com os botões
**Fui** e **Não fui**.

> ✅ Ela precisa aparecer **hoje mesmo**, algumas horas depois do horário — é saindo do consultório
> que a pessoa tem o que responder.
> ❌ Se só aparecer amanhã, é o bug corrigido em 25/08: o card comparava o **dia**, e não o
> instante, então nada de hoje contava como passado.
> ✅ O compromisso **futuro** não pode ter essa pergunta.

**H.20** Tocar em **"Fui"**.

> ✅ Deve gravar na hora, sem diálogo, e a linha virar **"Compareceu"** em azul com um ✓ e um
> lapisinho à direita.

**H.21** Tocar nessa linha.

> ✅ Deve abrir a folha "O que aconteceu?" com "Fui" já marcado.

**H.22** Escrever em **ANOTAÇÃO**: `médico pediu hemograma, retorno em 3 meses`. Salvar.

> ✅ A anotação deve aparecer no card, num bloco cinza claro.

**H.23** Tocar na linha de novo, tocar em **"Apagar esta resposta"** e salvar.

> ✅ 🔴 O card deve voltar a perguntar **"Você foi?"** — estado "sem resposta", que é diferente de
> "não fui". A anotação deve sumir junto.

**H.24** Marcar **"Fui"** de novo, escrever uma anotação, e então abrir o **lápis** desse mesmo
compromisso, mudar o local e salvar.

> ✅ 🔴 O desfecho e a anotação **não podem sumir** ao editar. Editar o compromisso não pode apagar
> o registro de que ele aconteceu.

**H.25** Tocar na **lixeira** de um deles.

> ✅ Deve pedir confirmação dizendo a data por extenso e que o aviso deixa de existir.

---

## Roteiro G — Apagamento

Cobre os itens 6, 7, 8 e 11 da §6.2. **Destrói dados — deixe por último.**

**G.1** Antes de apagar, cadastrar um remédio **com foto da caixa**, para testar o apagamento de
arquivos: novo cadastro manual, nome `Teste Foto`, forma comprimido, dose 1, todo dia, 1× às
`10:00`, uso contínuo. Na seção **ANEXOS**, tocar no quadrado de foto e escolher qualquer imagem
da galeria. Salvar.

**G.2** Ir em **Ajustes** → **MEUS DADOS** → **"Apagar meus dados de saúde"**.

> ✅ O diálogo deve dizer **o que some** (medicamentos, tratamentos, horários, histórico, estoque)
> e **o que fica** (ficha de saúde e consentimento).

**G.3** Confirmar.

> ✅ 🔴 O app deve **continuar aberto normalmente**, na aba de Ajustes, com **seu nome e sua ficha
> intactos** no topo. Não pode voltar para o onboarding.

**G.4** Ir em **Remédios** e na **Home**.

> ✅ Remédios vazio, com o estado "não tem nada cadastrado".
> ✅ Home mostrando o estado vazio de "nenhum remédio cadastrado".

**G.5** Ir em **Ajustes** → tocar no bloco azul do topo (sua ficha).

> ✅ Seus dados pessoais devem continuar lá — nome, data de nascimento, contatos de emergência.

**G.6** Voltar para Ajustes → **MEUS DADOS** → **"Apagar tudo e recomeçar"**.

> ✅ Primeiro diálogo listando tudo que some, inclusive ficha, fotos, receitas e o consentimento.

**G.7** Tocar em **"Continuar"**.

> ✅ 🔴 Deve aparecer um **segundo diálogo**, e ele deve **repetir o que acontece** — não só
> perguntar "tem certeza?". Deve dizer que a conta do Google **não é excluída**, só desvinculada.

**G.8** Tocar em **"Apagar tudo"**.

> ✅ 🔴 O app deve voltar para a **tela de login**, como recém-instalado.

**G.9** Entrar (com Google ou "continuar sem login").

> ✅ Deve pedir o **consentimento** de novo, e depois a **ficha de saúde** em branco.
> ✅ 🔴 Entre **com o Google** aqui: é o teste de que a conta volta a funcionar depois do
> apagamento total, que foi exatamente onde ela falhou em 25/08.

**G.10** Preencher só o nome e continuar. Ir em **Ajustes** → **CONTA**.

> ✅ Se você entrou com o Google no G.9, a conta deve aparecer vinculada, com o seu e-mail e a
> opção "Desvincular esta conta".
> ✅ Se entrou sem login, deve oferecer "Vincular uma conta do Google" — e vincular ali deve
> funcionar, sem a ressalva de indisponibilidade.

**G.11** Fechar o app completamente (tirar dos recentes) e abrir de novo.

> ✅ 🔴 Nada pode voltar. Sem medicamentos, sem histórico.

**G.12** Cadastrar um remédio novo **com foto** e olhar a imagem.

> ✅ 🔴 Não pode aparecer a foto do `Teste Foto` apagado. Se aparecer, os arquivos não foram
> removidos do diretório de documentos.

---

## Como reportar

Basta a lista dos que falharam, no formato:

```
B.10 falhou — a roda não apareceu, ficou um espaço branco no popup
F.9 falhou — estoque ficou em 17
resto ok
```

O que passar eu marco na §6.2 do plano; o que falhar vira correção antes de abrir a Fase C.
