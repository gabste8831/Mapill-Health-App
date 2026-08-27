# Roteiro de teste em aparelho — 2026-08-27

> 🔧 **Atualizado em 27/08** com os 15 itens fechados da revisão de 26/08. Os passos marcados com
> 🔧 mudaram ou nasceram nessa leva — são os que valem conferir primeiro.
>
> ⚠️ **A câmera (passo 15.2) exige build nova**, porque mexe no `app.json`. Todo o resto carrega
> recarregando o Metro.

> Guia operacional passo a passo: onde tocar, o que preencher, o que precisa acontecer.
> É a forma executável da fila de validação (§6.2 do `PLANO-DE-DESENVOLVIMENTO.md`).
>
> Escrito para quem **nunca usou o app**. Começa apagando tudo e termina apagando tudo de novo —
> o primeiro apagamento é para chegar ao zero, o último é para testar o direito de exclusão.
> Percorrer **na ordem**: os cadastros do começo alimentam os testes do meio.

## Antes de começar

**Não precisa de build novo.** Nenhuma dependência nativa nem o `app.json` mudaram desde a build
de 22/08. Com o perfil `development`, o JS vem da sua máquina:

```bash
npx expo start --dev-client
```

Abrir o **Mapill (dev)** no aparelho.

### De onde vem o login com Google

O `.env` **não sobe para o EAS** (está no `.easignore`), então até 25/08 qualquer build
`preview`/`production` saía com as credenciais do Supabase vazias e o login nascia indisponível —
foi o que aconteceu na build daquele dia. Resolvido cadastrando as variáveis no **servidor do EAS**,
que é onde credencial de build mora; no repositório, nunca.

| Build | De onde vem o JS | De onde vêm as credenciais |
|---|---|---|
| `development` + `npx expo start --dev-client` | Metro da sua máquina | `.env` local |
| `preview` / `production` | bundle gerado no servidor do EAS | variáveis de ambiente do EAS |

Cadastradas em 25/08 nos três ambientes: `EXPO_PUBLIC_SUPABASE_URL` e
`EXPO_PUBLIC_SUPABASE_ANON_KEY`. Conferir com `eas env:list --environment preview`. Se o login
voltar a dizer "indisponível nesta versão", é aqui que se olha primeiro.

### As quatro sessões

Dá para parar entre elas. Dentro de uma sessão, não.

| Sessão | Blocos | O que cobre | Tempo |
|---|---|---|---|
| **1 — Entrar** | 1 a 5 | apagamento inicial, os dois caminhos de login, ficha, termos | ~20 min |
| **2 — Cadastrar** | 6 a 15 | todas as formas farmacêuticas, todas as frequências, anexos, lembrete | ~50 min |
| **3 — Usar** | 16 a 19 | listagem, Home, estoque, calendário e compromissos | ~35 min |
| **4 — Sair** | 20 a 22 | conta, apagamento parcial, apagamento total | ~15 min |

### Como reportar

Só o que falhar, com o número do passo:

```
7.4 falhou — a roda não apareceu, ficou um espaço branco no popup
16.9 falhou — estoque ficou em 17
resto ok
```

🔴 marca os passos que existem para pegar um bug específico. Se um deles falhar, **pare o bloco e
avise** — os seguintes costumam depender dele.

---

# SESSÃO 1 — Entrar

## Bloco 1 — Chegar ao zero

Se o app **nunca foi aberto** neste aparelho, pule para o Bloco 2.

**1.1** Abrir o app e ir na aba **Ajustes** (última da barra de baixo).

**1.2** Descer até **MEUS DADOS** e tocar em **"Apagar tudo e recomeçar"**.

**1.3** No primeiro diálogo, tocar em **"Continuar"**.

> ✅ Precisa aparecer um **segundo diálogo**, e ele tem que **repetir o que acontece** — não só
> perguntar "tem certeza?".

**1.4** Tocar em **"Apagar tudo"**.

> ✅ 🔴 O app volta para a **tela de login**, como recém-instalado.

---

## Bloco 2 — Primeira abertura, sem conta

**2.1** Na tela de login, ler o rodapé.

> ✅ Deve dizer que os dados ficam neste aparelho com ou sem conta, e que entrar **prepara** a
> cópia na nuvem, que ainda não está disponível.
> ❌ Não pode prometer backup. Se prometer, é texto que sobrou.

**2.2** Conferir o botão **"Continuar com Google"**.

> ✅ Ele está **aceso**. Se estiver apagado dizendo que o login não foi configurado, o build saiu
> sem as credenciais — ver "Antes de começar".

**2.3** Tocar em **"Continuar sem login"**.

> ✅ Vai para o consentimento.

**2.4** Ler o destaque com o ícone de nuvem.

> ✅ Deve dizer **"Cópia em nuvem, opcional e ainda indisponível"** e afirmar que hoje os dados
> ficam só no aparelho.

**2.5** 🔴 Tocar na **seta de voltar** no topo do consentimento.

> ✅ Volta para a tela de login. A escolha de entrada é arrependível.

**2.6** Tocar em **"Continuar sem login"** de novo, e agora **aceitar os termos**.

> ✅ Vai para a ficha de saúde, em branco.

**2.7** 🔴 Tocar no **botão físico de voltar** do aparelho.

> ✅ Volta para o consentimento, **não** fecha o app.

**2.8** Aceitar de novo e voltar para a ficha. **Não preencher nada ainda** — segue no Bloco 4.

---

## Bloco 3 — Primeira abertura, com Google

Para testar o outro caminho, é preciso zerar de novo. Como ainda não há nada cadastrado, custa
dois toques.

**3.1** Preencher só o **NOME COMPLETO** com `Teste` e tocar em **"Salvar e continuar"**.

> ✅ Entra no app, na Home.

**3.2** **Ajustes** → **MEUS DADOS** → **"Apagar tudo e recomeçar"** → **Continuar** →
**Apagar tudo**.

> ✅ Volta para o login.

**3.3** 🔴 Tocar em **"Continuar com Google"**.

> ✅ Abre o navegador do sistema com a tela de contas do Google.

**3.4** 🔴 **Fechar o navegador sem escolher conta** (voltar / X).

> ✅ Volta para o app com um aviso de que o login foi cancelado. **Não pode travar** numa tela que
> não responde, nem entrar sem conta em silêncio.

**3.5** Tocar em **"Continuar com Google"** de novo e **escolher sua conta**.

> ✅ 🔴 Volta para o app sozinho e segue para o **consentimento**.
> ❌ Se ficar preso na aba do navegador, o retorno do OAuth não está fechando.

**3.6** Aceitar os termos.

> ✅ Vai para a ficha de saúde, em branco.

---

## Bloco 4 — Ficha de saúde completa

**4.1** Em **NOME COMPLETO**, digitar seu nome inteiro.

**4.2** Conferir os selos das duas seções.

> ✅ A primeira diz **OBRIGATÓRIO**, a segunda **OPCIONAL**.

**4.3** 🔧 *Reescrito em 27/08 (X7) — todo campo de data ganhou calendário.* Em
**DATA DE NASCIMENTO**, conferir que há um **ícone de calendário** à direita do campo.

> ✅ 🔴 Dá para **digitar** normalmente, como antes — o campo não foi substituído.
> ✅ Tocar no ícone abre o **calendário nativo**, com "Cancelar" e "Confirmar".
> ✅ "Confirmar" nasce **apagado** até você tocar num dia: a data em que ele abre é ponto de
> partida, não resposta.
> ✅ 🔴 Datas **no futuro** não podem ser escolhidas — ninguém nasceu amanhã.
> ✅ Escolher um dia preenche o campo no formato `DD/MM/AAAA`.

**4.3b** 🔴 **O teste que motivou o X7.** Digitar `29/02/2025` à mão (2025 não é bissexto).

> ✅ O campo acusa data inválida.
> ✅ Abrindo o calendário em fevereiro de 2025, o dia **29 não existe** para ser tocado — é o
> problema resolvido na origem, e não uma mensagem depois do erro.

**4.4** Escolher **SEXO BIOLÓGICO** e **TIPO SANGUÍNEO**.

**4.5** No campo de alergias (placeholder `Ex: Dipirona, látex...`), digitar `Dipirona`.

**4.6** Em **OBSERVAÇÕES**, digitar `hipertenso, acompanhamento no posto`.

**4.7** Tocar em **"Adicionar contato"**. Preencher **NOME** `Maria`, **TELEFONE**
`(47) 99999-0000`, **VÍNCULO** `Mãe`. Tocar em **"Salvar contato"**.

> ✅ O contato aparece na lista, com nome e vínculo.

**4.8** Adicionar um **segundo** contato: `João`, `(47) 98888-0000`, `Irmão`.

> ✅ Os dois convivem na lista.

**4.9** Tocar em **"Salvar e continuar"**.

> ✅ Entra no app, na Home.

**4.10** 🔴 **Fechar o app completamente** (tirar dos recentes) e abrir de novo.

> ✅ Abre **direto na Home**. Sem login, sem termos, sem ficha.
> ❌ Se voltar para o login, é o bug corrigido em 25/08: o app só pulava a primeira execução
> quando havia sessão do Google.

**4.11** **Ajustes** → tocar no bloco azul do topo (sua ficha).

> ✅ Tudo que você preencheu está lá, incluindo os dois contatos.

**4.12** Mudar as observações para `hipertenso, acompanhamento no posto — trocou de médico` e
salvar. Voltar e abrir de novo.

> ✅ A alteração persistiu.

---

## Bloco 5 — Termos e privacidade

**5.1** **Ajustes** → **PRIVACIDADE** → **"Termos e privacidade"**.

**5.2** Conferir o bloco **SEU CONSENTIMENTO**.

> ✅ Mostra **"Aceito em"** com a data de hoje **e o horário** (`27/08/2026 às 14:32`), **"Versão
> aceita"** e **"Versão atual"**. 🔧 *Corrigido em 27/08 (X13) — só conferir.*
> ✅ 🔴 As duas versões precisam ser **iguais** (`1.1.0`). Diferentes significaria que o app está
> em uso com um aceite vencido.

**5.3** Abrir o acordeão **"Termos de Uso"** e depois **"Política de Privacidade"**.

> ✅ Abrem e fecham, com o texto legível.

**5.4** 🔴 Na Política de Privacidade, procurar a seção sobre onde os dados ficam.

> ✅ Precisa dizer que **nesta versão os dados de saúde não saem do aparelho, mesmo com a conta
> vinculada**. Não pode descrever backup que não existe.

---

# SESSÃO 2 — Cadastrar

## Bloco 6 — Onde nasce um cadastro

**6.1** Na **Home**, tocar no **+** azul do canto inferior direito.

> ✅ Abre a escolha com **"Cadastrar uma medicação"** e **"Cadastrar um compromisso"**.

**6.2** Voltar. Ir na aba **Calendário** e tocar no **+**.

> ✅ 🔴 O botão existe nesta aba e abre a **mesma escolha completa**.

**6.3** Voltar. Ir na aba **Remédios** e tocar no **+**.

> ✅ 🔴 Abre **direto** "Escanear código de barras | Cadastro manual" — sem passar pela pergunta
> "medicação ou compromisso?". Estar nesta aba já respondeu isso.

**6.4** Tocar em **"Escanear código de barras"**.

> ✅ Tela dizendo que a leitura do código ainda está sendo desenvolvida, com botão de voltar.
> *(Intencional — é o bloco B3, ainda não construído. Não pode dar erro nem tela branca.)*

**6.5** Voltar e tocar em **"Cadastro manual"**.

---

## Bloco 7 — Comprimido, todo dia (e o relógio nativo)

**7.1** **NOME DA MEDICAÇÃO**: `Losartana 50mg`

**7.2** **COMO VOCÊ TOMA?** → **"Comprimido ou cápsula"**.

> ✅ 🔴 **Não** aparece pergunta de unidade. A pergunta seguinte já vem escrita
> "QUANTOS COMPRIMIDOS DE CADA VEZ" — a forma resolve a unidade sozinha.

**7.3** **QUANTOS COMPRIMIDOS DE CADA VEZ**: `1`

**7.4** **QUAL A FREQUÊNCIA?** → **"Todo dia"**. Depois **QUANTAS VEZES POR DIA?** → **2×**.

**7.5** 🔧 *Reescrito em 27/08 (X1) — o relógio agora abre em modo digitação.* Em
**EM QUE HORÁRIOS?**, tocar em **"Definir horários"**, e no popup tocar na caixa da **1ª DOSE**
(mostra `--:--`).

> ✅ 🔴 Abrem **dois campos numéricos grandes** — hora e minuto —, e **não** o mostrador
> analógico. Era o mostrador que escondia a distinção entre manhã e noite.
> ✅ 🔴 É **24 horas**: digitar `20` dá 20:00, e não existe AM/PM para interpretar errado.
> ✅ As cores são as do app (azul), **não** o verde do tema do sistema.
> ✅ Há um ícone de **relógio** no canto que alterna para o mostrador analógico, para quem
> preferir girar — a mudança é só qual dos dois abre primeiro.
> ❌ Se não aparecer nada, ou aparecer espaço em branco: **pare e me avise**. É componente Compose
> dentro de um `Modal`, que no Android abre em outra janela.

**7.6** Sem digitar nada, olhar o botão **"Confirmar"**.

> ✅ Está **apagado**. O valor em que o campo abriu é ponto de partida, não resposta.

**7.7** Digitar **08:00** e tocar em **Confirmar**. Repetir na **2ª DOSE** com **20:00**.

**7.8** 🔧 *Novo em 27/08 (X1).* Abrir um horário de novo e tocar no ícone de **relógio** no canto.

> ✅ Alterna para o mostrador analógico e volta para a digitação. Os dois modos continuam
> disponíveis — nenhum foi removido.

**7.9** 🔴 **Testar o horário duplicado.** Abrir a 2ª dose e mudar para **08:00** também.

> ✅ As duas fichinhas ficam em vermelho e aparece **"Dois horários iguais tocariam duas vezes pela
> mesma dose."**

**7.10** Voltar a 2ª dose para **20:00**. Tocar em **"Pronto"**.

> ✅ Duas fichinhas cinza na tela: `08:00` e `20:00`.

**7.11** Em **QUANDO COMEÇA**, conferir que diz **"Hoje"** com um link **"Alterar"** ao lado. Não
alterar agora.

**7.12** **QUAL O TEMPO DO TRATAMENTO?** → **"Uso contínuo"**.

> ✅ 🔴 Aparece **"Seu medicamento já pode ser cadastrado!"** e, abaixo, as seções opcionais
> (ESTOQUE, ANEXOS, LEMBRETE, INFORMAÇÕES ADICIONAIS). O botão do rodapé **acende no mesmo
> instante**.

**7.13** Antes de continuar, apagar o **NOME** e olhar o rodapé.

> ✅ 🔴 O botão apaga, o rodapé diz **"Falta preencher o nome."** e as seções opcionais **somem**.

**7.14** Escrever o nome de novo. Na seção **ESTOQUE**, tocar em **"Controlar meu estoque"**.

**7.15** No popup: **QUANTOS COMPRIMIDOS VOCÊ TEM** `30`, **ONDE VOCÊ GUARDA**
`Gaveta da cozinha`. Marcar **"Me avisar quando estiver acabando"** e escolher **7 dias**.

> ✅ Aparece uma frase dizendo até quando o estoque dura — **cerca de 15 dias** (30 comprimidos,
> 2 por dia).

**7.16** 🔴 Trocar a antecedência para **30 dias**.

> ✅ A frase muda de cor e diz que o estoque dura ~15 dias, **portanto um aviso de 30 dias de
> antecedência não é possível**. Não pode aceitar calado.

**7.17** Voltar para **7 dias**, tocar em **"Pronto"** e depois em **"Salvar medicação"**.

> ✅ Confirmação de tela cheia e, depois de ~3 segundos, a **lista de medicações** com a Losartana.

---

## Bloco 8 — Líquido: quando a unidade é pergunta

**8.1** Novo cadastro manual. **NOME**: `Xarope Expectorante`

**8.2** **COMO VOCÊ TOMA?** → **"Líquido (xarope, solução)"**.

> ✅ 🔴 Agora **aparece** a pergunta **"COMO A DOSE É MEDIDA?"**, com as fichas **ml**, **mg** e
> **g** — porque aqui a unidade é ambígua de verdade.
> ✅ Abaixo, a dica: *"O copinho ou a seringa que vem na caixa marcam em ml."*
> ✅ A pergunta de quantidade **ainda não existe**: perguntar "quanto de cada vez" de uma unidade
> indefinida não significa nada.

**8.2b** 🔧 *Novo em 27/08 (X4).* Olhar a dica sobre o copinho.

> ✅ Ela vem num **bloco próprio**, com ícone de **`?`** à esquerda e fundo alaranjado tênue — não
> mais um texto cinza igual ao resto.

**8.3** Escolher **ml**.

> ✅ Só agora aparece **"QUANTOS ML DE CADA VEZ"**.

**8.4** Digitar `7,5`.

> ✅ 🔴 A **vírgula entra** — ml é medida contínua.

**8.5** **QUAL A FREQUÊNCIA?** → **"Todo dia"** → **3×** → definir `08:00`, `14:00`, `20:00`.

**8.6** **QUAL O TEMPO DO TRATAMENTO?** → **"Tem prazo"** → **QUANTO TEMPO DURA** `10` → **dias**.

> ✅ Aparece uma linha dizendo de quando até quando, e **quantas doses** o tratamento tem no total.

**8.7** **ESTOQUE** → "Controlar meu estoque" → **QUANTOS ML VOCÊ TEM** `100` → **Pronto**.

> ✅ 🔴 Aviso em cor de atenção: o tratamento inteiro consome **225 ml** e você tem 100.
> *(7,5 × 3 × 10 = 225.)*

**8.8** Salvar.

---

## Bloco 9 — Gotas: dose e estoque em unidades diferentes

**9.1** Novo cadastro manual. **NOME**: `Dipirona gotas`

**9.2** **COMO VOCÊ TOMA?** → **"Gotas"**.

> ✅ **Não** pergunta a unidade — a pergunta já vem "QUANTAS GOTAS DE CADA VEZ".

**9.3** Digitar `2,5`.

> ✅ 🔴 A **vírgula NÃO entra**, só sai `25`. Meia gota não existe.

**9.4** Corrigir para `20`. **QUAL A FREQUÊNCIA?** → **"Só quando precisar"**.

> ✅ 🔴 Aparece **"Nenhum horário será agendado. Você registra a dose quando tomar."**
> ✅ Os campos de horário **somem**.
> ✅ **QUANDO COMEÇA** também some — não há agenda para começar.

**9.5** Olhar as opções de tempo de tratamento.

> ✅ 🔴 A primeira opção **não** diz "Uso contínuo" — diz **"Sempre disponível"**. O Dorflex da
> mochila não é contínuo, é permanente e sem agenda.

**9.6** Escolher **"Sempre disponível"**. Ir em **ESTOQUE** → "Controlar meu estoque".

> ✅ 🔴 A pergunta é **"QUANTOS ML VOCÊ TEM"**, e não "quantas gotas" — gota se toma em gota e se
> compra em ml, e é o ml que está impresso no frasco.

**9.7** Digitar `20` e tocar em **Pronto**.

> ✅ 🔴 **Nenhuma frase de "dura X dias"** aparece. Estoque em ml e dose em gotas não se dividem
> sem a concentração do frasco, que o app não tem — e um número aqui seria inventado.

**9.8** Salvar.

---

## Bloco 10 — Injeção: dose que muda de horário para horário

**10.1** Novo cadastro manual. **NOME**: `Insulina NPH`

**10.2** **COMO VOCÊ TOMA?** → **"Injeção"**.

> ✅ Pergunta **"COMO A DOSE É MEDIDA?"** com **ml**, **UI** e **mg**.
> ✅ Dica: *"Caneta de insulina marca em UI; ampola e seringa costumam vir em ml."*

**10.3** Escolher **UI**. Em **QUANTAS UNIDADES (UI) DE CADA VEZ**, digitar `10`.

**10.4** **QUAL A FREQUÊNCIA?** → **"Todo dia"** → **2×** → **"Definir horários"**.

**10.5** 🔧 *Reescrito em 27/08 (E7) — o checkbox mudou de lugar.* Logo **abaixo do campo de dose**,
marcar **"A dose muda de um horário para o outro"**.

> ✅ 🔴 Ele está ali, junto da dose — e **não** mais escondido dentro do popup de horários.
> Respondê-lo lá dentro obrigava a preencher o número duas vezes.
> ✅ Só aparece com **mais de um horário** definido: com um só não há "de um para o outro".
> ✅ Abrindo o popup de horários, há um campo de quantidade em **cada** horário, com `10` como
> placeholder.

**10.6** Definir `08:00` com dose `10` e `22:00` com dose `8`. Tocar em **"Pronto"**.

> ✅ 🔴 As fichinhas mostram **`08:00 · 10`** e **`22:00 · 8`**, não só a hora.

**10.7** **QUAL O TEMPO DO TRATAMENTO?** → **"Uso contínuo"**.

**10.8** **ESTOQUE** → "Controlar meu estoque" → **QUANTAS UNIDADES (UI) VOCÊ TEM** `300` →
**Pronto**.

> ✅ 🔴 A previsão precisa dizer **16 ou 17 dias** — nunca 15.
> *(10 + 8 = 18 UI por dia, não 2 × 10 = 20. Se disser 15, o app está multiplicando a dose padrão
> em vez de somar as doses reais. A folga de um dia depende de já ter passado das 08:00.)*

**10.9** Salvar.

---

## Bloco 11 — Dias da semana

**11.1** Novo cadastro manual. **NOME**: `Metotrexato` · **COMO VOCÊ TOMA?** →
**"Comprimido ou cápsula"** · **QUANTOS COMPRIMIDOS DE CADA VEZ**: `2`

**11.2** **QUAL A FREQUÊNCIA?** → **"Dias da semana"**.

> ✅ Aparece **"EM QUAIS DIAS?"** com as sete fichas: Dom, Seg, Ter, Qua, Qui, Sex, Sáb.

**11.3** Sem escolher dia nenhum, olhar o rodapé.

> ✅ 🔴 O botão está apagado e o rodapé cobra os dias.

**11.4** Marcar **Seg** e **Qui**.

> ✅ As duas fichas ficam preenchidas.

**11.5** **QUANTAS VEZES NO DIA?** → **1×** → definir **09:00**.

> ✅ 🔴 O rótulo diz **"QUANTAS VEZES NO DIA?"** e não "POR DIA" — não é todo dia.

**11.6** **"Uso contínuo"** e salvar.

---

## Bloco 12 — Ciclo: a cartela

**12.1** Novo cadastro manual. **NOME**: `Anticoncepcional` · **"Comprimido ou cápsula"** ·
dose `1`.

**12.2** **QUAL A FREQUÊNCIA?** → **"A cada X dias"**.

> ✅ Aparece **"A CADA QUANTOS DIAS?"**. Os outros campos do ciclo **ainda não** — cada um depende
> do anterior.

**12.3** Digitar `28`.

> ✅ Só agora aparece **"POR QUANTOS DIAS SEGUIDOS?"**, com o placeholder
> *"1 dia, se for dose única"*.

**12.4** Digitar `21`.

> ✅ Só agora aparece **"ESTE CICLO COMEÇOU QUANDO?"**, com **"Começa hoje"** e
> **"Já comecei antes"**.

**12.5** 🔴 Tocar em **"Já comecei antes"** e, em **PRIMEIRO DIA DESTE CICLO**, digitar uma data de
**25 dias atrás**. 🔧 *Novo em 27/08 (X7):* este campo também tem calendário, e nele os dias **no
futuro** estão apagados — "já comecei antes" é sempre passado.

> ✅ 🔴 Aparece uma frase dizendo **"Você está na pausa. Volta a tomar em DD/MM/AAAA."**
> *(25 dias de um ciclo 28/21: os 21 dias de tomada acabaram no dia 21, então hoje é pausa.)*

**12.6** Trocar a data para **10 dias atrás**.

> ✅ A frase vira **"Você toma até DD/MM/AAAA, faz a pausa, e recomeça em DD/MM/AAAA."**

**12.7** 🔴 Testar o absurdo: mudar **POR QUANTOS DIAS SEGUIDOS** para `40`.

> ✅ Erro no campo: **"Entre 1 e 27. Tomar todos os dias do ciclo é 'todo dia'."**
> ✅ A pergunta "ESTE CICLO COMEÇOU QUANDO?" **some** enquanto o erro existe.

**12.8** Voltar para `21`. **QUANTAS VEZES NO DIA?** → **1×** → **08:00**. **"Uso contínuo"**.
Salvar.

---

## Bloco 13 — Antibiótico: preencher de X em X horas

**13.1** Novo cadastro manual. **NOME**: `Amoxicilina 500mg` · **"Comprimido ou cápsula"** ·
**QUANTOS COMPRIMIDOS DE CADA VEZ**: `2`

*(dois de propósito — é o que prova, no Bloco 17, que o estoque desconta a dose e não uma unidade)*

**13.2** **QUAL A FREQUÊNCIA?** → **"Todo dia"** → **3×** → **"Definir horários"**.

**13.3** No popup, **sem preencher nada**, tocar em **"Preencher de X em X horas"** (fica abaixo
dos três campos).

**13.4** Em **DE QUANTAS EM QUANTAS HORAS (3 doses)**, digitar `8`.

**13.5** Tocar em **PRIMEIRO HORÁRIO**, escolher **06:00** na roda e confirmar.

> ✅ Aparece o bloco **FICARIA ASSIM** com `06:00`, `14:00`, `22:00`.

**13.6** 🔴 **Testar o bloqueio.** Trocar o intervalo para `12`.

> ✅ Erro em vermelho: **3 doses de 12 em 12 horas passam de um dia**, e alguma cairia em cima da
> outra. O botão **"Preencher"** fica apagado.
> *(3 × 12 = 36 horas.)*

**13.7** Voltar para `8` e tocar em **"Preencher"**.

> ✅ Volta para a lista com os três horários preenchidos.

**13.8** 🔴 Abrir "Preencher de X em X horas" de novo. 🔧 *Conferir também (X9):* o botão
**"Cancelar"** tem **contorno visível**, e não é mais um texto solto ao lado do "Preencher".
Tocar em **"Cancelar"** e depois em **"Pronto"**.

> ✅ Os horários `06:00`, `14:00`, `22:00` continuam lá — cancelar não desfez o que já valia.

**13.9** **QUAL O TEMPO DO TRATAMENTO?** → **"Tem prazo"** → `7` → **dias**.

**13.10** **ESTOQUE** → "Controlar meu estoque" → `20` → **Pronto**.

> ✅ Aviso em cor de atenção: o tratamento consome **42 comprimidos** e você tem 20.
> *(3 × 2 × 7 = 42.)*

**13.11** Salvar.

---

## Bloco 14 — Tratamento que começa depois

**14.1** Novo cadastro manual. **NOME**: `Vitamina D` · **"Comprimido ou cápsula"** · dose `1` ·
**"Todo dia"** · **1×** · horário **09:00**.

**14.2** Em **QUANDO COMEÇA**, tocar em **"Alterar"**.

> ✅ A linha "Hoje" vira um campo de data vazio, com placeholder `DD/MM/AAAA`.
> ✅ 🔧 *Novo em 27/08 (X7):* com **ícone de calendário** ao lado. Aqui **não há limite** — começar
> hoje, amanhã ou retomar um tratamento antigo são todos casos legítimos.

**14.3** 🔴 **Testar a data pela metade.** Digitar só `27/0` e olhar o rodapé.

> ✅ O botão de salvar está **apagado** e o rodapé diz que falta **"a data de início"**.
> Data incompleta não pode virar "hoje" por omissão.

**14.4** Completar para **3 dias à frente**.

**14.5** **"Uso contínuo"** e salvar.

**14.6** Ir na aba **Home**.

> ✅ 🔴 A Vitamina D **NÃO** pode aparecer na agenda de hoje. Se aparecer, a data de início não
> está recortando a geração de horários.

---

## Bloco 15 — Anexos, lembrete e anotações

**15.1** Novo cadastro manual. **NOME**: `Teste Anexos` · **"Comprimido ou cápsula"** · dose `1` ·
**"Todo dia"** · **1×** · **10:00** · **"Uso contínuo"**.

**15.2** 🔧 *Reescrito em 27/08 (E2 e F3).* Na seção **ANEXOS**, tocar no quadrado com o ícone de
câmera.

> ✅ 🔴 Abre um popup perguntando **de onde vem a foto**: "Tirar foto agora" e "Escolher da
> galeria". Antes só havia galeria.
> ✅ Escolher **"Tirar foto agora"** pede permissão de câmera na primeira vez e abre a câmera.
> ✅ 🔴 A foto escolhida **aparece na hora** no quadrado — era o F3, causado por cache de imagem.
> ✅ O texto vira **"Trocar foto da caixa"**.

**15.2b** 🔴 Trocar a foto por outra, duas vezes seguidas.

> ✅ A miniatura muda **toda vez**. Se ficar presa na primeira, o cache voltou.

**15.3** 🔧 *Reescrito em 27/08 (X2).* Na linha de baixo, conferir a seção da receita.

> ✅ 🔴 Existe o rótulo **RECEITA MÉDICA** acima dela — antes o campo não dizia para que servia.
> ✅ Duas opções: **"Escolher da galeria"** e **"Escolher arquivo"**. O texto era "Tirar da
> galeria", que prometia abrir a câmera.
> ✅ 🔴 Os dois rótulos cabem lado a lado **sem quebrar no meio da palavra** — era a quebra de
> layout relatada.
> ✅ O texto abaixo diz quais formatos são aceitos e que o arquivo **fica só no aparelho**.

**15.4** Tocar em **"Escolher arquivo"** e escolher um **PDF** (qualquer um).

> ✅ Aparece um ícone de PDF e o **nome do arquivo** embaixo.
> ✅ 🔴 Só agora aparece o campo **"RECEITA VÁLIDA ATÉ"** — sem receita guardada, não há o que
> vencer.
> ✅ 🔧 *Novo em 27/08 (X2):* com o anexo escolhido, existem **duas** ações — **"Alterar anexo"** e
> **"Remover"** (esta em vermelho). Antes só havia remover, e trocar exigia apagar — o que levava
> junto a validade e o aviso já preenchidos.

**15.5** Preencher a validade com uma data **60 dias à frente**.

> ✅ 🔴 Só agora aparece o checkbox **"Me avisar antes de a receita vencer"**.
> ✅ 🔧 *Novo em 27/08 (X7):* abrindo o **calendário** deste campo, os dias **já passados** estão
> apagados — receita vencida deixou de ser aceita em 26/08, e o calendário passa a dizer o mesmo
> antes do toque.

**15.6** Marcar o checkbox e escolher **30 dias**.

> ✅ 🔴 A frase diz **a data em que o aviso chega**, não a antecedência — é o que dá para conferir
> contra a agenda.

**15.7** 🔧 *Reescrito em 27/08 (X3).* Na seção **LEMBRETE**, tocar em **"Configurar lembrete"**.

> ✅ 🔴 Abre o popup **"Como quer ser avisado?"** com **três** opções: alarme, notificação e os
> dois. **"Nenhum aviso" não existe mais** — ele obrigava a entrar na configuração para dizer que
> não se quer configurar nada.
> ✅ Existe um aviso **"Depende do seu aparelho"** e um acordeão **"Como funcionam os alertas"**.

**15.7b** 🔴 Fechar o popup **sem escolher nada** e salvar o medicamento.

> ✅ Salva normalmente. Não configurar já é recusar — é o que substitui o "nenhum aviso".

**15.8** Abrir o acordeão e ler.

> ✅ Abre e fecha. Precisa ter um trecho dizendo **o que o Mapill não faz**.
> ✅ 🔧 *Novo em 27/08 (X15):* no fim dele há o link **"Ler os Termos de Uso completos"**,
> sublinhado. Tocar nele **abre os termos** — antes era só uma frase mandando procurar numa "aba
> Perfil" que nem existe com esse nome.
> ✅ Voltar dos termos devolve ao cadastro **com tudo preenchido**.
> ℹ️ Esta seção está congelada a pedido, esperando uma conversa própria com o C1. Só confira que
> ela abre, escolhe e fecha sem erro.

**15.9** Escolher **"Notificação comum"** e tocar em **"Pronto"**.

> ✅ A seção passa a mostrar a escolha, com um link **"Editar"**.

**15.10** Em **INFORMAÇÕES ADICIONAIS**, na fileira **COMO TOMAR**, marcar **"Em jejum"** e
**"Com bastante água"**.

**15.11** 🔴 Marcar também **"Outra orientação"**.

> ✅ Aparece o campo **"QUAL ORIENTAÇÃO?"**. Digitar `diluir em meio copo d'água`.

**15.12** Desmarcar **"Outra orientação"**.

> ✅ O campo some.

**15.13** Marcar de novo, preencher, e completar **PRINCÍPIO ATIVO** com `Teste` e
**OBSERVAÇÃO GERAL** com `o azul é o da manhã`.

**15.14** Salvar.

---

# SESSÃO 3 — Usar

## Bloco 16 — Aba Remédios

**16.1** Ir na aba **Remédios**.

> ✅ Estão lá os **nove** cadastros: Losartana, Xarope, Dipirona gotas, Insulina NPH, Metotrexato,
> Anticoncepcional, Amoxicilina, Vitamina D e Teste Anexos.
> ✅ Cada um com dose, frequência, horários e estoque.
> ✅ O **Teste Anexos** mostra a **foto da caixa** à esquerda do nome.

**16.2** 🔴 Conferir o card da **Insulina NPH**.

> ✅ A dose aparece como **"Dose variável (unidades (UI))"**, e não como um número só — porque um
> número ali estaria errado nas duas pontas.

**16.3** Conferir o card da **Dipirona gotas**.

> ✅ Frequência **"Só quando precisar"** e **nenhuma** fichinha de horário.

**16.3c** 🔧 *Novo em 27/08 (E3).* Conferir a fileira de ordenação abaixo da busca.

> ✅ Três fichas: **A–Z**, **Mais recentes** e **Acabando**. Uma sempre marcada.
> ✅ 🔴 "Acabando" põe na frente quem tem menos estoque, e **empurra para o fim** quem não controla
> estoque — sem número não há urgência a comparar.
> ✅ "Mais recentes" traz o `Teste Anexos` para o topo, que foi o último cadastrado.

**16.3b** 🔧 *Novo em 27/08 (X6).* Rolar a lista para baixo.

> ✅ O texto **"Abaixo, suas medicações cadastradas..."** e o botão de estoque **rolam junto** e
> saem da tela.
> ✅ 🔴 A **busca continua fixa** no topo — é ela que precisa estar sempre à mão.

**16.4** Na busca, digitar `losart` — **sem acento e em minúsculas**.

> ✅ Acha a Losartana. O contador vira **"1 de 9"**.

**16.5** Apagar e digitar `teste`.

> ✅ Acha o Teste Anexos pelo **princípio ativo**, que é `Teste`.

**16.6** Digitar `xyz`.

> ✅ Estado vazio dizendo que **não achou com esse termo** — diferente de "não tem nada cadastrado".

**16.7** Limpar a busca. Tocar no **lápis** da **Insulina NPH**.

> ✅ 🔴 O formulário abre **já preenchido**, inclusive a unidade **UI** marcada, as doses `10` e `8`
> por horário, e o checkbox "A dose muda de um horário para o outro" **ligado**.

**16.8** Sem mudar nada, tocar no **botão físico de voltar**.

> ✅ 🔴 Fecha o formulário e devolve para a lista — **não** fecha o app.

**16.9** Abrir o lápis do **Anticoncepcional**.

> ✅ 🔴 O ciclo volta preenchido: 28, 21, "Já comecei antes" e a data que você digitou.

**16.10** Voltar. Tocar na **lixeira** da **Vitamina D**.

> ✅ Pede confirmação explicando **o que some** (os horários futuros) e **o que fica**
> (o histórico de ingestão).

**16.11** Confirmar.

> ✅ A Vitamina D some e o contador cai para **8**.

---

## Bloco 17 — Home: doses, atrasadas e correção

**Faça este bloco à noite**, para que os horários já tenham passado.

**17.1** Novo cadastro manual, para forçar atrasadas: **NOME** `Teste Atrasadas` ·
**"Comprimido ou cápsula"** · **QUANTOS COMPRIMIDOS DE CADA VEZ** `2` · **"Todo dia"** · **3×** ·
horários **que já passaram hoje** (`06:00`, `07:00`, `08:00`) · **"Uso contínuo"** ·
**ESTOQUE** `20`. Salvar.

**17.1b** 🔧 *Novo em 27/08 (F1 e E10).* Ainda no cadastro, **antes de salvar**, olhar abaixo dos
horários.

> ✅ 🔴 O app **avisa** quais horários de hoje já passaram e não serão agendados, e diz que amanhã
> o dia entra normal.
> ✅ 🔴 Abaixo, a pergunta **"VOCÊ JÁ TOMOU ALGUMA DELAS HOJE?"**, com uma ficha por horário.
> ✅ Nada vem marcado — o app não sabe, e marcar por ele inventaria registro clínico.

**17.1c** 🔴 Marcar **um** dos horários e ler a frase abaixo.

> ✅ Diz que **1 dose entra no histórico de hoje** e que **o estoque não muda** — porque o número
> que você informou já é o que tem na caixa agora.
> ❌ Se disser que o estoque desconta, é a versão antiga.

**17.1d** Salvar e conferir o resultado.

> ✅ Em **Remédios**, o estoque do `Teste Atrasadas` está em **20** — o que você digitou, intacto.
> ✅ Na **Home**, a dose marcada aparece como **já confirmada** hoje.

**17.2** Ir na aba **Home**.

> ✅ No topo, seu nome e a data por extenso.
> ✅ **PROGRESSO DIÁRIO** com a barra e "X de Y doses concluídas hoje".
> ✅ Um bloco em vermelho dizendo **"N doses atrasadas"**, com o link **"Confirmar todas"** ao lado.

**17.3** 🔴 Tocar em **"Confirmar todas"**.

> ✅ 🔴 O diálogo **lista os nomes de cada dose**, uma por linha, com quantidade e horário — não só
> "3 doses". E avisa que o estoque de cada uma será descontado.

**17.4** Confirmar.

> ✅ Todas ficam confirmadas de uma vez e o progresso sobe.

**17.5** 🔴 **Conferir a conta do estoque.** Ir em **Remédios** e olhar o `Teste Atrasadas`.

> ✅ O estoque está em **14**, não em 17.
> *(20 − 3 doses × 2 comprimidos = 14. Se der 17, o app desconta uma unidade por dose em vez da
> dose inteira.)*

**17.6** Voltar para a **Home** e olhar uma dose que **ainda não chegou**.

> ✅ 🔴 Ela **não** tem botões de confirmar/pular. Só a próxima e as atrasadas têm ação — o app não
> convida a marcar o que ainda não aconteceu.

**17.7** Tocar numa dose **já confirmada**.

> ✅ Abre a troca de desfecho, oferecendo **"Não tomei"**, e avisando que corrigir **devolve a
> quantidade ao estoque**.

**17.8** 🔴 Confirmar a correção e conferir em **Remédios**.

> ✅ O estoque do `Teste Atrasadas` **subiu 2**, indo para 16.

**17.9** Voltar na Home e marcar essa dose como tomada de novo.

> ✅ O estoque volta para 14.

**17.10** Tocar numa dose e escolher **"Pular"**.

> ✅ O diálogo avisa que a dose fica registrada como não tomada e que **o estoque não é
> descontado**.

**17.11** Conferir o gráfico de adesão da semana.

> ✅ Aparece só porque existe dia medido. Dias sem dose agendada não podem aparecer como falha.

---

## Bloco 18 — Estoque

**18.1** 🔧 *Reescrito em 27/08 (X5) — o ícone no topo saiu.* Agora há **duas** portas, e ambas só
existem quando há estoque cadastrado. Conferir as duas:

- Na **Home**, um card **"Estoque"** dizendo quantas medicações são controladas.
- Na aba **Remédios**, um botão **"Gerenciar estoques dos medicamentos"** logo abaixo do texto de
  apoio.

> ✅ 🔴 Qualquer uma abre a tela **Estoque**.
> ✅ 🔴 **Não** pode haver ícone de caixa no cabeçalho de Medicações — ele foi removido.

**18.2** Olhar a lista.

> ✅ Só aparecem os remédios com controle de estoque ativado.
> ✅ O que acaba primeiro está **em cima**.
> ✅ Cada cartão traz a quantidade à direita e, abaixo, "Acaba em N dias · 12 de set".
> ✅ 🔧 *Novo em 27/08 (E3):* fileira de ordenação com **Acaba primeiro**, **Menos na caixa** e
> **A–Z**. As duas primeiras são perguntas diferentes — dois comprimidos de uso diário acabam
> antes de vinte de um remédio semanal.

**18.3** 🔴 Conferir a **Amoxicilina**.

> ✅ Diz **"Acaba em 3 dias"**.
> *(20 comprimidos, 3 doses de 2 = 6 por dia.)*
> ❌ Se disser 6 ou 7 dias, o app conta 1 comprimido por dose.

**18.4** 🔴 Conferir a **Dipirona gotas**.

> ✅ Diz **"Sem previsão de término"**.
> ❌ Se disser um número de dias, é o bug corrigido em 25/08: estoque em ml e dose em gotas não se
> dividem sem a concentração do frasco.

**18.5** 🔴 Conferir a **Insulina NPH**.

> ✅ Diz **16 ou 17 dias**, nunca 15 — 10 UI de manhã e 8 à noite consomem 18 por dia, não 20.

**18.6** No `Teste Atrasadas`, tocar em **"Recontar"**.

> ✅ O popup diz **"Hoje o app conta 14 comprimidos"**, e o campo **QUANTO VOCÊ TEM AGORA** está
> **vazio** — nunca pré-preenchido.
> ✅ O botão **Confirmar** está **apagado**.

**18.7** 🔴 Digitar `11` e olhar a frase acima do botão, **sem confirmar**.

> ✅ Diz **"Diferença de 3 a menos, registrada como recontagem"** — e não "o estoque passa a ser
> 11". É a diferença que é gravada, e a tela precisa dizer isso.

**18.8** Apagar e digitar `14` (o mesmo número que já estava).

> ✅ A frase vira **"É exatamente o que o app já conta — nada muda"**, e o Confirmar **apaga de
> novo**.

**18.9** Voltar para `11` e **Confirmar**.

> ✅ O cartão passa a mostrar **11 comprimidos**.

**18.10** Tocar em **"Repor"** no mesmo remédio e digitar `30`.

> ✅ A frase diz **"O estoque passa para 41 comprimidos"** — soma, não substitui.

**18.11** Confirmar.

> ✅ Mostra **41**, e a previsão de "acaba em N dias" **aumentou**.

**18.12** Abrir "Recontar" e digitar um número com vírgula, como `20,5`.

> ✅ A vírgula **entra** — meio comprimido existe. A prévia mostra a diferença com a casa decimal.
> Fechar **sem confirmar**.

**18.13** Descer até o fim da lista.

> ✅ Bloco cinza **"Falta alguma medicação nesta lista?"** com o botão **"Ver minhas medicações"**.

**18.14** Tocar nele.

> ✅ Volta para a aba Remédios.

**18.15** Ir na **Home** e procurar o card **"Alerta de estoque"**.

> ✅ Só existe **um** botão, **"Abrir estoque"**, e ele leva para a tela nova — não para o cadastro
> do remédio.

---

## Bloco 19 — Compromissos e calendário

**19.1** Aba **Calendário** → **+** → **"Cadastrar um compromisso"**.

**19.2** Em **DESCRIÇÃO DO COMPROMISSO**, digitar `Consulta com cardiologista`.

> ✅ É campo de **texto livre**, não lista de opções.

**19.3** Em **DATA**, digitar uma data **3 dias à frente**. Em **HORÁRIO**, tocar no campo.

> ✅ Abre a **mesma roda** do cadastro de medicamento, e "Confirmar" só acende depois de girar.

**19.4** Escolher **14:30** e confirmar.

> ✅ 🔴 Abaixo dos campos, a confirmação por extenso **com o dia da semana**:
> "Sexta-feira, 27 de agosto, às 14:30". É o dia da semana que denuncia quem errou o número.

**19.5** 🔧 *Reescrito em 27/08 (E8) — o passado deixou de ser bloqueado.* Voltar no campo DATA e
digitar uma data **de ontem**.

> ✅ 🔴 **Não** trava mais. Aparece o aviso: *"Esse compromisso já passou. Ele entra na agenda como
> registro, e não haverá lembrete — você poderá anotar o que aconteceu."*
> ✅ 🔴 A seção **LEMBRETES some por completo** — não há aviso a dar sobre o que já aconteceu.
> ✅ O botão de salvar **acende**: registrar a consulta que já foi é uso legítimo, e é para isso
> que existe o "você foi?".

**19.5b** 🔧 *Novo em 27/08 (X7).* Tocar no **ícone de calendário** ao lado do campo DATA.

> ✅ Dias passados **podem** ser escolhidos — o bloqueio saiu junto com o E8.

**19.6** Voltar para 3 dias à frente. Preencher **LOCAL DE ATENDIMENTO**
`Clínica São José, sala 12`, **NOME DO PROFISSIONAL** `Dra. Ana Martins, cardiologista` e
**ORIENTAÇÕES E PREPARO** `levar exames antigos`.

**19.7** 🔴 Em **DESEJA SER LEMBRADO DESTE COMPROMISSO?**, tocar em **"Não"**.

> ✅ A opção "Não" **fica marcada**. Se voltar ao cinza de não respondida, o seletor perdeu a
> resposta.
> ✅ As perguntas de baixo não aparecem.

**19.8** Tocar em **"Sim"**.

> ✅ Aparecem **duas** perguntas: "LEMBRAR NO DIA DO COMPROMISSO?" e "LEMBRAR COM ANTECEDÊNCIA?".

**19.9** 🔴 Responder **"Não"** para as duas.

> ✅ O salvar trava e o rodapé diz que falta **"ao menos um dos dois lembretes"** — dizer não para
> os dois é o mesmo que não querer aviso.

**19.10** **"Sim"** para as duas. Escolher **7 dias antes**.

> ✅ 🔴 Aviso em cor de atenção: **essa antecedência já passou** — a consulta é em 3 dias.

**19.11** Trocar para **1 dia antes**.

> ✅ Mostra **a data em que o aviso chega**, por extenso.
> ✅ Abaixo, diz que a escolha fica salva mas que os lembretes ainda estão sendo desenvolvidos.
> *(Intencional: o disparo depende do C1.)*

**19.12** 🔧 *Reescrito em 27/08 (X8) — o campo livre saiu de dentro da fileira.* Abaixo dos
atalhos há agora um campo próprio, **"OUTRO PRAZO, EM DIAS"**. Digitar `15` nele.

> ✅ O campo tem largura de verdade, não espremido ao lado das fichas.
> ✅ O atalho selecionado **desmarca** sozinho.
> ✅ Volta a avisar que a antecedência já passou.
> ✅ Digitar `0` ou `999` dá erro pedindo **entre 1 e 180 dias**.
> ✅ O rótulo da fileira agora é **"COM QUANTOS DIAS DE ANTECEDÊNCIA"**.

**19.13** Voltar para **1 dia antes** e salvar.

> ✅ Confirmação de tela cheia e, depois, a aba **Calendário** com o compromisso.

**19.14** Conferir o card.

> ✅ Agrupado sob o dia, com a hora à esquerda, a descrição, o nome da profissional, o local, o
> preparo, e no rodapé **"Lembrar 1 dia antes e no dia"**.

**19.15** 🔧 *Reescrito em 27/08 (E1) — a aba virou calendário de verdade.* Ir na aba
**Calendário**.

> ✅ 🔴 No topo, uma **grade do mês** azul, com os dias da semana e os números.
> ✅ **Hoje** tem contorno branco; o **dia selecionado** tem círculo branco preenchido.
> ✅ Dias com algo marcado têm **pontinhos** embaixo do número: branco cheio para compromisso,
> mais apagado para dose.
> ✅ Abaixo da grade, a fileira de filtros: **Tudo**, **Compromissos**, **Remédios**.
> ✅ Abaixo dela, o que existe **no dia selecionado** — com hora, nome e quantidade nas doses.
> ✅ A **Dipirona gotas** ("só quando precisar") **não** aparece em dia nenhum — ela não tem
> horário agendado.

**19.15b** 🔴 Tocar num dia que tem pontinho.

> ✅ O círculo branco se move para ele, e a lista abaixo troca para o conteúdo daquele dia.

**19.15c** 🔴 Tocar num dia **vazio**.

> ✅ Diz **"Nada marcado para este dia."** — não fica com a lista do dia anterior.

**19.15d** 🔴 Testar os filtros.

> ✅ **"Compromissos"**: os pontinhos de dose **somem da grade** e a lista mostra só consultas.
> ✅ **"Remédios"**: o inverso.
> ✅ 🔴 Grade e lista mudam **juntas** — mês pintado de dose com lista só de compromisso seriam
> duas respostas para a mesma pergunta.
> ✅ Num dia sem nada do tipo filtrado, a frase vira "Nenhum compromisso neste dia." ou "Nenhuma
> dose neste dia.".

**19.16** 🔴 Tocar na **seta de próximo mês**, duas vezes.

> ✅ A grade avança e a seleção vai para o **dia 1º** do mês visitado — a lista nunca mostra um dia
> que não está na grade.
> ✅ As doses **continuam aparecendo** dois meses à frente (são projetadas na hora, além dos 30
> dias gravados). Se sumirem, a projeção falhou.
> ✅ Voltando ao mês corrente, a seleção retorna para **hoje**, e não para o dia 1º.

**19.17** 🔴 Numa dose de **hoje** ainda não respondida, tocar no **✓**.

> ✅ Confirma na hora, a linha fica mais apagada, com o ✓ colorido.
> ✅ Na **Home**, a mesma dose aparece confirmada — é o mesmo registro.

**19.18** Conferir uma dose de um dia **futuro**.

> ✅ 🔴 Ela **não** tem ✓ nem ✗. Só hoje e dias passados aceitam resposta.

**19.19** Conferir uma dose num dia **além dos 30 dias**.

> ✅ 🔴 Também **sem** botões — ela é projetada, não existe registro para apontar.

**19.20** Cadastrar um segundo compromisso para **hoje, num horário que já passou** (ex: 08:00 se
já for noite), descrição `Coleta de sangue`.

> ✅ Aparece agrupado sob **"Hoje"**, junto das doses do dia.

**19.21** 🔴 Nesse compromisso, conferir a pergunta **"Você foi?"** com **Fui** e **Não fui**.

> ✅ Ela precisa aparecer **hoje mesmo**, algumas horas depois do horário.
> ❌ Se só aparecer amanhã, é o bug corrigido em 25/08: o card comparava o **dia**, não o instante.
> ✅ O compromisso **futuro** não tem essa pergunta.

**19.22** Tocar em **"Fui"**.

> ✅ Grava na hora, **sem diálogo**, e a linha vira **"Compareceu"** com um ✓ e um lapisinho.

**19.23** Tocar nessa linha.

> ✅ Abre a folha **"O que aconteceu?"** com "Fui" já marcado.

**19.24** Escrever em **ANOTAÇÃO**: `médico pediu hemograma, retorno em 3 meses`. Salvar.

> ✅ A anotação aparece no card, num bloco cinza claro.

**19.25** 🔴 Tocar na linha, tocar em **"Apagar esta resposta"** e salvar.

> ✅ O card volta a perguntar **"Você foi?"** — estado "sem resposta", que é diferente de "não fui".
> A anotação some junto.

**19.26** 🔴 Marcar **"Fui"** de novo, escrever uma anotação, e então abrir o **lápis** desse mesmo
compromisso, mudar o local e salvar.

> ✅ O desfecho e a anotação **não somem**. Editar o compromisso não pode apagar o registro de que
> ele aconteceu.

**19.27** Tocar na **lixeira** de um deles.

> ✅ Pede confirmação dizendo a **data por extenso** e que o aviso deixa de existir.

---

# SESSÃO 4 — Sair

## Bloco 20 — Vincular e desvincular a conta

**20.1** 🔧 *Reescrito em 27/08 (E4) — conta e dados viraram tela própria.* Ir em **Ajustes**.

> ✅ 🔴 A tela agora tem **duas** coisas: o bloco azul da ficha e uma linha **"Conta e dados"**.
> As seções CONTA, PRIVACIDADE e MEUS DADOS **não estão mais soltas ali**.

**20.1b** Tocar em **"Conta e dados"**.

> ✅ Abre a tela **"Conta e dados"**, com as três seções: **CONTA**, **PRIVACIDADE** e
> **MEUS DADOS**.
> ✅ Se você entrou com o Google no Bloco 3: diz **"Desvincular esta conta"** com o seu e-mail.
> ✅ Se entrou sem conta: diz **"Vincular uma conta do Google"**, com a frase de que a cópia na
> nuvem ainda não está disponível.
> ✅ Abaixo do cartão: **"Seus dados ficam neste aparelho"**.
> ✅ A seta de voltar retorna para Ajustes.

**20.2** 🔧 *Reescrito em 27/08 (P2).* Se estiver **sem** conta, tocar em
**"Vincular uma conta do Google"**.

> ✅ 🔴 **Antes de abrir o Google**, aparece um diálogo dizendo que vincular confirma os termos
> (com o número da versão) e que o aceite fica registrado com a data de hoje.
> ✅ Ele repete que os dados de saúde continuam só no aparelho.
> ✅ Há três opções: **Cancelar**, **Ler os termos** e **Vincular**.

**20.2b** Tocar em **"Ler os termos"**.

> ✅ Abre a tela de termos. Confirmar não pode ser assinar às cegas.

**20.2c** Voltar, tocar em **"Vincular"** e entrar com o Google.

> ✅ 🔴 Volta com a conta vinculada, e **nenhum medicamento é perdido**. Entrar depois não toca no
> banco local.

**20.2d** 🔴 Ir em **Conta e dados** → **"Termos e privacidade"**.

> ✅ A data de **"Aceito em"** é de **agora** — o aceite da vinculação foi registrado.
> ❌ Se continuar mostrando a data do onboarding, o registro não gravou.

**20.3** Tocar em **"Desvincular esta conta"**.

> ✅ O diálogo diz que medicamentos, histórico e ficha **continuam** no aparelho.

**20.4** Confirmar.

> ✅ O cartão volta a oferecer "Vincular uma conta do Google".

**20.5** 🔴 Ir em **Remédios**.

> ✅ Os oito cadastros continuam lá. Desvincular não apaga nada.

**20.6** 🔴 Fechar o app completamente e abrir de novo.

> ✅ Abre **direto na Home**, mesmo sem conta vinculada.

---

## Bloco 21 — Apagar só os dados de saúde

**21.1** **Ajustes** → **MEUS DADOS** → **"Apagar meus dados de saúde"**.

> ✅ O diálogo diz **o que some** (medicamentos, tratamentos, horários, histórico, estoque) e
> **o que fica** (ficha de saúde e consentimento).

**21.2** Confirmar.

> ✅ 🔴 O app **continua aberto normalmente**, na aba de Ajustes, com seu nome e sua ficha
> **intactos** no topo. Não pode voltar para o onboarding.

**21.3** Ir em **Remédios**, na **Home** e no **Calendário**.

> ✅ Remédios vazio, com o estado "não tem nada cadastrado".
> ✅ Home no estado vazio de "nenhum remédio cadastrado".
> ✅ Calendário vazio — os compromissos também são dado clínico.

**21.4** 🔧 *Reescrito em 27/08 (X5).* Procurar o acesso ao estoque na **Home** e em **Remédios**.

> ✅ 🔴 Os **dois somem**: sem estoque cadastrado, o card da Home e o botão de Medicações deixam de
> existir. É o comportamento correto — eles levariam a uma tela vazia.

**21.5** **Ajustes** → tocar no bloco azul do topo.

> ✅ 🔴 Seus dados pessoais continuam: nome, data de nascimento, os dois contatos de emergência.

---

## Bloco 22 — Apagar tudo

**22.1** Antes de apagar, cadastrar um remédio **com foto da caixa**, para testar o apagamento de
arquivos: cadastro manual, nome `Teste Foto`, comprimido, dose 1, todo dia, 1× às `10:00`, uso
contínuo. Em **ANEXOS**, escolher uma imagem da galeria. Salvar.

**22.2** **Ajustes** → **MEUS DADOS** → **"Apagar tudo e recomeçar"**.

> ✅ Primeiro diálogo listando tudo que some, inclusive ficha, fotos, receitas e o consentimento.

**22.3** Tocar em **"Continuar"**.

> ✅ 🔴 Aparece um **segundo diálogo**, e ele **repete o que acontece** — não só pergunta "tem
> certeza?". Diz que a conta do Google **não é excluída**, só desvinculada.

**22.4** Tocar em **"Apagar tudo"**.

> ✅ 🔴 O app volta para a **tela de login**, como recém-instalado.

**22.5** 🔴 Entrar **com o Google**.

> ✅ É o teste de que a conta volta a funcionar depois do apagamento total — foi exatamente aqui
> que ela falhou em 25/08.

**22.6** Aceitar os termos.

> ✅ Pede o consentimento de novo, e depois a **ficha de saúde em branco**.

**22.7** Preencher só o nome e continuar. Ir em **Ajustes** → **CONTA**.

> ✅ A conta aparece **vinculada**, com o e-mail que você acabou de usar.

**22.8** 🔴 Fechar o app completamente e abrir de novo.

> ✅ Abre direto na Home. **Nada volta**: sem medicamentos, sem histórico, sem compromissos.

**22.9** 🔴 Cadastrar um remédio novo **com foto** e olhar a imagem.

> ✅ **Não** pode aparecer a foto do `Teste Foto` apagado. Se aparecer, os arquivos não foram
> removidos do diretório de documentos.

---

## Como reportar

Só a lista dos que falharam:

```
7.5 falhou — a roda não apareceu, ficou um espaço branco no popup
18.3 falhou — disse 6 dias
resto ok
```

O que passar eu marco na §6.2 do plano; o que falhar vira correção antes de abrir a Fase C.
