# Roteiro de teste em aparelho

> **Este é o único roteiro de teste do projeto**, e os blocos estão **na ordem de execução**: comece
> pelo 1 e siga até o 19, sem pular. A numeração é o caminho, não um índice.
>
> | | O que é | Quando | Tempo |
> |---|---|---|---|
> | **[Parte 1 — Integridade](#parte-1--integridade)** | O que pode estar **quebrado** | **Primeiro** | ~1h30 |
> | **[Parte 2 — Passada geral](#parte-2--passada-geral)** | O app inteiro, do zero, como quem nunca o abriu | Antes da defesa | ~2 h |

## Por que esta ordem

**Os blocos de alarme (11 a 19) ficam no fim, e isso não é preferência.** O bloco 19 mexe no relógio
do sistema e reinstala o app; o 18 exige reiniciar o aparelho. Depois deles o estado do celular não
serve para mais nada — qualquer teste anterior teria que ser refeito.

Dentro do alarme, o **bloco 11 abre a sequência**: é a tela de diagnóstico, e ela responde em cinco
segundos o que antes exigia esperar vinte minutos e adivinhar.

Os blocos **1 e 2** vêm primeiro porque reprovaram na última rodada e foram corrigidos — é o que
mais interessa saber agora.

## 📋 O que a rodada de 05/09 já respondeu

> Registrado para não retestar o que passou. **Se algum destes falhar agora é regressão**, e vale
> usar essa palavra ao reportar: muda o diagnóstico.

| Bloco | Resultado em 05/09 |
|---|---|
| **12** — Permissões do alarme | ✅ 100%. Só reconferir que a build nova não regrediu |
| **4** — Câmera e CMED | ✅ Funciona. Fica um ajuste pendente: o nome do medicamento vem **todo em maiúsculas** |
| **7** — Fonte ampliada | ✅ Funciona, com uma ressalva: **os horários dos cards quebram linha** no máximo |
| **5** — Os menores | ✅ Um defeito aberto: a adesão só conta doses **cujo horário já passou** |
| **6** — Relatório em PDF | ✅ Funcionando bem |
| **8** — Passe de design | ✅ |
| **3** — Revisão tela a tela | ✅ Estética aprovada. Falta conferir **os quatro temas** |
| **10** — Regressão | ✅ |
| **1** e **2** — Sync e export | ❌ **Reprovaram**, corrigidos em 05 e 06/09 |
| **18** e **19** — Alarme | ❌ **Reprovaram.** O Notifee foi arquivado, e o boot receiver dele nunca era invocado no Android 12+ |

**Ajustes pequenos ainda não feitos**, anotados dessa rodada: nome do EAN capitalizado, quebra de
linha dos horários com fonte grande, adesão contando resposta antecipada, e a fonte do nome na lista
de remédios um pouco menor.

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

⚠️ **Build nova, e desinstale a anterior.** Os motivos se somam:

1. Permissões novas no `app.json` — a última foi `RECEIVE_BOOT_COMPLETED` (06/09), e permissão não
   entra por recarga do Metro.
2. A biblioteca de avisos é **dependência nativa**, e ela mudou: o Notifee foi arquivado em
   07/04/2026, e o app migrou para o fork mantido (`react-native-notify-kit`).
3. Um canal de notificação já criado fica **congelado** no aparelho: som e importância não mudam por
   atualização. Instalar por cima manteria o alarme mudo — foi assim que o defeito do canal sem som
   sobreviveu a várias sessões.
4. `expo-camera` é dependência nativa (bloco 4).

⚠️ **Aparelho físico.** Emulador não serve para os blocos de alarme — o que está em jogo é o
comportamento do sistema com o app fechado e sob economia de bateria.

```bash
npx expo start --dev-client
```

**Confirme em 10 segundos que é a build certa:** abra `Ajustes → Desenvolvimento → Diagnóstico de
avisos`. Se a seção "DESENVOLVIMENTO" não existir, a build é anterior a 06/09.

---

# PARTE 1 — Integridade
## 1 — A restauração dos dados 🔴 (D1)

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

**5.5** 🔴 **O teste que importa:** desinstale o app, instale de novo, entre **com a mesma conta**.

> ✅ 🔴 **Não pede os termos de novo** — o consentimento válido veio da nuvem.
> ✅ 🔴 **Não pede para preencher a ficha** — ela veio junto.
> ✅ Remédios, tratamentos, histórico e compromissos **voltam**.
> ✅ 🔴 Os **alarmes voltam agendados**: confira no diagnóstico (`Ajustes → Desenvolvimento`) que o
> número de agendados bate com o esperado. As doses descem para o banco, mas o agendamento vive no
> sistema operacional — o app tem que refazê-lo ao restaurar.
> ✅ As **fotos não voltam** — esperado, anexos não sobem.

**5.6** 🔴 **A ficha, campo por campo.** Abra `Ajustes → Ficha de saúde` e confira **todos**:

> ✅ Nome, data de nascimento, sexo, tipo sanguíneo.
> ✅ 🔴 **Alergias** — devem aparecer como fichinhas cinzas. Foi o campo que sumiu no teste de
> 06/09, e o defeito atingia quatro colunas ao mesmo tempo.
> ✅ 🔴 **Contatos de emergência** — mesma família de defeito.
> ✅ Observações.

**5.7** 🔴 **A posologia sobreviveu?** Abra um remédio cadastrado antes da reinstalação.

> ✅ A frequência e os horários são os mesmos. _(A posologia também é coluna JSON, e viajava pelo
> mesmo caminho que quebrou nas alergias.)_

> **Por que estes passos ganharam detalhe.** O 5.5 reprovou em 05/09 — nada voltava, e o app pedia
> termos e ficha de novo. A causa era **ordem**: o app perguntava ao banco local antes de o pull
> rodar. Corrigido. Em 06/09, com a restauração já funcionando, faltaram **as alergias**: as colunas
> JSON (`allergies`, `emergency_contacts`, `schedule`, `intake_instructions`) atravessavam sem
> conversão entre o `TEXT` do SQLite e o `jsonb` do Postgres. Também corrigido, com 10 verificações
> em Node — mas é em aparelho que se prova.

🔬 **Anote:** quanto tempo até os dados aparecerem?

---

## 2 — Exportar e apagar 🔴 (D3)

⚠️ **Faça por último — o 6.2 apaga tudo.**

**6.1** **Ajustes** → **Conta e dados** → **MEUS DADOS** → **"Baixar uma cópia dos meus dados"**.

> ✅ Abre o compartilhamento do Android. Salve o arquivo.
> ✅ 🔴 É um **`.zip`**, não mais um `.json`. Dentro há uma planilha `.csv` por tabela e um
> `LEIA-ME.txt`.
> ✅ **Uma ficha de saúde só** no `ficha-de-saude.csv`. Duas significam que a restauração criou uma
> segunda — foi o rastro que denunciou o defeito de 05/09.
> 🔬 🔴 **Abra um CSV** (no celular ou mande para o computador). **Os acentos estão certos?**
> "Medicação", não "MedicaÃ§Ã£o". É o ponto mais provável de falhar, e é o que decide se o arquivo
> serve para alguma coisa.
> 🔬 Cadastre um remédio com **vírgula na observação** antes de exportar, e confira que ela não
> desloca as colunas da planilha.

**6.2** 🔬 **Com a conta vinculada**, **"Apagar meus dados de saúde"** → confirme.

> ✅ Os remédios somem.
> ✅ 🔬 **O que importa:** feche o app, abra e espere sincronizar. Eles **não voltam**.
> ❌ Se voltarem, o apagamento na nuvem falhou — avise.

---

## 3 — A revisão tela a tela (05/09)

**O que este bloco cobre.** Uma rodada inteira de revisão em aparelho, tela por tela, com o Gabriel
navegando e apontando. Saiu muita coisa transversal (cor, espaçamento) e três regras de domínio
novas. Os itens marcados 🔬 dependem de conferir **nesta build**, porque nunca rodaram em binário.

### A. As cores de estado

**A1. O vermelho.** Percorra: dose atrasada na Home, "Estoque zerado", card de alerta de estoque,
ícone de dose pulada, botão de excluir.

> ✅ Nenhum deles parece **rosa** ou **vinho**. Os três tons são o mesmo vermelho em intensidades
> diferentes — o do card cheio é escuro, o do ícone é aceso, o do texto fica no meio.
> ✅ O card de alerta de estoque tem fundo vermelho escuro com texto branco legível.
> 🔬 Com a **fonte do sistema no máximo**, o texto branco do card continua legível.

**A2. O verde.** Dose "É AGORA" na Home, ícone de dose tomada, compromisso de hoje.

> ✅ A faixa lateral verde do cartão "é agora" salta; o rótulo verde é mais escuro que ela, e isso é
> proposital — rótulo é texto e precisa de contraste maior.

**A3. O amarelo.** Selo "acaba em N dias" no Estoque, lembrete de recontagem, painel de permissões.

> ✅ 🔴 O texto do aviso **não é marrom**. O fundo é amarelo claro e o texto, cinza.
> ✅ O amarelo não se confunde com o vermelho de erro: são cores diferentes, não graus da mesma.

**A4. Os quatro temas** 🔬. Ajustes → Configurações de tema. Percorra Home e Estoque em cada um.

> 🔬 **Só o tema padrão foi revisado em aparelho.** Escuro, alto contraste e daltonismo receberam os
> tokens novos com valores conferidos por contraste, mas não foram vistos. Anote o que destoar — está
> registrado como pendência de refinamento.

### B. A Home

**B1. As doses já registradas.** Confirme duas ou três doses e olhe o bloco "Já registradas".

> ✅ 🔴 Elas aparecem numa **lista compacta** — um cartão só, com divisórias —, e não em cartões
> separados. Quanto mais doses respondidas, **menos** espaço elas ocupam.
> ✅ Tocar numa linha ainda abre a correção retroativa.

**B2. As seções.** Role a Home inteira.

> ✅ Cada bloco tem rótulo: "Se aproximando", "Minha adesão", "Estoque".
> ✅ "Ver compromissos" fica **dentro** de "Se aproximando"; "Gerenciar estoque" dentro de "Estoque".
> ✅ Os dois atalhos são de uma linha só, com borda azul e sem sombra.

**B3. A marca-d'água.** Card azul de próxima dose e card vermelho de alerta.

> ✅ Cada um tem um ícone grande e semitransparente cortado no canto inferior direito.
> ✅ Ele não atrapalha a leitura do horário nem do nome.

**B4. A barra de navegação.**

> ✅ 🔴 A aba ativa **não** tem mais a pílula azul atrás do ícone. O que a marca é a cor do ícone e o
> rótulo.
> 🔬 Confira que a cor não mudou sozinha (o Android tende a usar a cor do papel de parede).

### C. Compromissos 🔬

**C1. O card aparece quando o lembrete dispara** 🔬. Cadastre um compromisso para **daqui a 5 dias**
com lembrete de **7 dias de antecedência**.

> ✅ Ele aparece na Home hoje, no bloco "Se aproximando", com o selo "em 5 dias".
> ✅ O card mostra o **preparo** (o campo "observações" do cadastro), se houver.
> ✅ Tocar nele abre a listagem **já com o detalhe daquele compromisso** aberto.

**C2. A janela respeita o pedido** 🔬. Cadastre um para **daqui a 30 dias** com lembrete de 7 dias.

> ✅ Ele **não** aparece na Home. Aparece só na contagem do card "Ver compromissos".
> ✅ Um compromisso para **hoje sem lembrete nenhum** ainda aparece na Home.

**C3. A notificação do compromisso** 🔬🔴. Este é o item que nunca funcionou em binário. Cadastre um
compromisso com lembrete "no dia" e espere as 8h da manhã seguinte.

> 🔬 🔴 **A notificação chega?** Se não chegar, é o mesmo defeito do canal mudo dos remédios — a
> correção está no código desde a build anterior.

**C4. A listagem.** Abra Compromissos.

> ✅ Há um campo de busca. Digite o nome do **médico** ou o **local** — não só o título.
> ✅ Os já realizados estão num acordeão "N anteriores" no fim, separados por um traço.
> ✅ A contagem do topo conta **só os que ainda não passaram**.

### D. Minha adesão

**D1. O dia a dia.** Abra a tela de adesão.

> ✅ Há uma faixa "Seus últimos sete dias" com sete colunas: número em %, barra e data.
> ✅ A barra é **igual à do card da Home** — mesma altura, mesma cor, hoje mais forte.
> ✅ Dia sem dose agendada mostra um **traço**, não "0%".
> ✅ A faixa continua com 7 dias mesmo trocando o período para 30 ou 90.

**D2. O PDF com seleção** 🔬. Role até "Seu relatório de adesão".

> ✅ Há dois seletores: medicamentos **e** compromissos, independentes.
> ✅ Escolha só um remédio e gere: o PDF sai só com ele.

### E. As listas

**E1. O seletor de ordem.** Remédios e Estoque.

> ✅ 🔴 **Todas** as opções aparecem de uma vez, sem rolar para o lado.
> ✅ As não selecionadas são visíveis — não somem no fundo.
> ✅ No Estoque há **duas** opções ("Acaba primeiro", "A–Z"). "Menos na caixa" foi removida.

**E2. O card de estoque.** Abra Estoque.

> ✅ O card mostra nome, quantidade e o selo de prazo — **sem** o local e **sem** a linha divisória.
> ✅ O selo do prazo tem ícone e existe nos três estados (neutro, âmbar, vermelho).
> ✅ "Recontar" e "Repor" são mais baixos que antes, e ainda fáceis de acertar.

**E3. O espaçamento do topo.** Remédios e Estoque.

> ✅ Busca → filtros → conteúdo: o primeiro degrau é menor que o segundo.
> ✅ A contagem ("3 medicações cadastradas") fica **junto da lista**, não junto da busca.

### F. Conta e dados

**F1. A exportação** 🔬🔴. Conta e dados → "Baixar uma cópia dos meus dados".

> ✅ 🔴 Sai um arquivo **`.zip`**, não mais um `.json`.
> 🔬 Abra o zip: há uma planilha `.csv` por tabela e um `LEIA-ME.txt`.
> 🔬 **Abra um CSV no celular ou mande para o computador.** Os acentos estão certos? ("Medicação",
> não "MedicaÃ§Ã£o".) Este é o defeito mais provável, e é o que decide se o arquivo serve.
> 🔬 Um medicamento com **vírgula na observação** não desloca as colunas da planilha.

**F2. A tela.**

> ✅ Abre com uma faixa azul clara, ícone de escudo e uma frase sobre o que se resolve ali.
> ✅ Os subtítulos das linhas são menores que os títulos.

**F3. Ajustes.**

> ✅ 🔴 **Não** há mais o aviso de "N alterações não sincronizadas".
> ✅ As linhas do menu são mais baixas, e ainda confortáveis de tocar.

### G. Alarme e calendário

**G1. O local no alarme** 🔬. Cadastre um remédio com estoque e preencha **onde ele fica guardado**.
Dispare o alarme.

> 🔬 Abaixo da dose aparece um ícone de localização com o texto ("armário da cozinha").
> ✅ Ele é pequeno — o horário e o nome continuam sendo o que se lê de longe.

**G2. O dia do calendário.** Toque em vários dias da grade.

> ✅ 🔴 O destaque é **redondo**. Não aparece um quadrado atrás ao tocar.
> ✅ O compromisso do dia tem uma barra colorida na lateral esquerda.

### H. Termos

> ✅ Os dois acordeões ("Termos de Uso", "Política de Privacidade") têm fundo **branco** e se
> distinguem do fundo da tela.

---

## 4 — Câmera e base de medicamentos (B1, B3)

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

## 5 — Os menores (C2, C3, D2, B5)

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
> ✅ **Excluindo o compromisso**, o aviso dele **não chega**. _(Órfão, agora para compromisso.)_

**10.5 — Recontagem (B5).** Remédios → **Gerenciar estoques**.

> ✅ Com estoque recém-cadastrado, o bloco amarelo **não aparece** — ele só surge após **30 dias**
> sem conferência. Provavelmente não dá para ver agora, e tudo bem.

---

## 6 — O relatório em PDF (D4)

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

> ✅ Diz **"ainda não há o que medir"**, e em lugar nenhum aparece **0%**. _(RN20: zero por cento é
> uma afirmação sobre o paciente; ausência de dados não é.)_

**12.7** 🔬 **Se tiver acesso a uma impressora**, imprima em **preto e branco**.

🔬 **Anote:** ficou legível? Alguma seção depende de cor para ser entendida?

**12.8** **Modo avião ligado**, gere o relatório.

> ✅ Gera normalmente — nenhum dado sai do aparelho para o PDF existir.

---

## 7 — O visual com a fonte ampliada

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
> _(Era o defeito mais grave da varredura: `height` travado recortava o rótulo de todo botão do app.
> Devolva a fonte ao normal depois.)_

**9.4** Toque nos botões de **excluir** na lista de remédios e no calendário, e no **×** de uma
alergia na ficha.

> ✅ Dá para acertar **sem esforço**, mesmo com o dedo. Nenhum alvo minúsculo.

**9.5** 🔬 **Opcional, se der tempo:** ative o **TalkBack** e toque numa dose da Home.

> ✅ 🔬 Ele lê a linha como **uma frase só**, na ordem: _"Dipirona, 08:00, atrasada. 1 comprimido"_.
> ✅ 🔬 Os botões **Confirmar** e **Pular** continuam sendo lidos separadamente.
> ❌ Se ele parar quatro vezes na mesma linha, ou ler o estado antes do nome, anote.

---

## 8 — O passe de design (02/09)

**As catorze frentes, fechadas.** Todas mexeram em coisa transversal — toque, teclado, tipografia,
cor, movimento. Este bloco cobre o que mudou; a regressão de todas as telas vem depois, no bloco 14.

**A. O toque responde.** Percorra Home, Remédios, Estoque e Cadastro tocando em botões, chips,
ícones e linhas.

> ✅ 🔴 **Tudo** o que é tocável escurece e/ou encolhe ao toque. Antes nada respondia.
> ✅ Nada treme: linhas de largura total (checkbox, acordeão) só escurecem, não encolhem.

**A2. O que faltava responder** _(02/09, tarde — 23 alvos em 10 telas)_. A varredura anterior pegou
o kit; estes são os que cada tela desenhava à mão e escaparam.

> ✅ 🔴 **Home**: "Confirmar" e "Pular" numa dose respondem ao toque. Eram os dois alvos **mais
> tocados do app** e os únicos mudos.
> ✅ **Ajustes** e **Conta**: as linhas da lista, o voltar do topo azul, o bloco da identidade.
> ✅ **Calendário**: editar, excluir, "Fui"/"Não fui", confirmar/pular dose, a linha do desfecho.
> ✅ **Estoque**: "Repor" e "Recontar".
> ✅ **Home**: os cards de adesão, estoque e estoque baixo.
> ✅ **Cadastro**: linhas de valor, os quadros de foto, as fichinhas de dia da semana.
> ✅ **Ficha**: a lixeira de contato, o quadro da foto.
> ✅ 🔴 O painel de permissões: cada linha escurece ao toque antes de abrir a tela do sistema.

**A3. Os alvos pequenos demais** 🔴. Links de texto que eram só palavra, sem área de dedo.

> ✅ Em **Ficha de saúde**, "Trocar foto" e "Remover" têm **44pt de altura** — antes tinham a
> altura da letra (~20pt).
> ✅ O mesmo em **Cadastro**: "Alterar anexo", "Remover receita", "Adicionar arquivo".
> ✅ Todos ganham **fundo** ao toque, em vez de nada acontecer.
> 🔬 **Com a fonte do sistema no máximo**, confira se algum desses links corta o texto.

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

**I. O movimento** _(frente 5)_. Três lugares, e **nenhum outro** — se algo mais estiver animando,
é defeito.

**I.1 — A barra de progresso da Home.** Com duas ou mais doses no dia, confirme uma.

> ✅ 🔴 A barra **cresce** até a nova porcentagem, em vez de saltar.
> ✅ O movimento dura menos de meio segundo e não atrasa o toque seguinte.
> ✅ Confirmando duas em sequência rápida, a barra acompanha sem engasgar.

**I.2 — A linha da dose.** Ainda na Home, confirme uma dose e olhe a linha dela.

> ✅ 🔴 A linha **esmaece** até o estado resolvido, em vez de trocar de aparência num quadro.
> ✅ Os botões "Confirmar"/"Pular" sobem e somem junto.
> ✅ Numa dose que vira **"É AGORA"** sozinha (espere o horário chegar com a tela aberta), os
> botões **aparecem suavemente**, não brotam.

**I.3 — O dia completo** 🔴. Confirme a **última** dose pendente do dia.

> ✅ Aparece a tela cheia de sucesso: **"Dia completo"** com a contagem das doses.
> ✅ Ela **some sozinha** em ~3s e devolve a Home — não navega para lugar nenhum.
> ✅ 🔴 **Feche o app e reabra com o dia já completo**: a comemoração **não** volta. Ela é para o
> momento em que o dia fecha, não para o estado de estar fechado.
> ✅ Corrigindo uma dose para "não tomei" e confirmando de novo, ela reaparece — o dia fechou de novo.

**I.4 — A entrada da lista.** Saia da Home e volte.

> ✅ As doses entram **em cascata**, de cima para baixo, cada uma logo após a anterior.
> ✅ Com muitas doses (6+), as últimas **não** ficam esperando: o escalonamento tem teto.

**I.5 — Reduzir movimento** 🔴🔬. Ligue **Configurações → Acessibilidade → Reduzir movimento** (ou
"Remover animações") e repita I.1 a I.4.

> ✅ 🔴 **Nada anima** — a barra pula direto para o valor, a lista aparece inteira, a linha muda de
> uma vez.
> ✅ Tudo continua **correto**: os números, os estados e a comemoração do dia completo seguem
> aparecendo. Só o movimento sai.
> 🔬 Se alguma coisa ainda se mexer, anote qual: é a que não está lendo a preferência do sistema.

**J. O popup de lembrete, desafogado** _(frente 6)_. Cadastro → linha **LEMBRETE**.

> ✅ 🔴 A folha tem **só**: a pergunta, as três opções, o painel de permissões (quando falta algo) e
> "Pronto". O botão **cabe na tela** sem rolar.
> ✅ 🔴 O acordeão "Como funcionam os alertas" **não está mais ali** — virou um link.
> ✅ O aviso "Depende do seu aparelho" **sumiu da folha**.

Toque em **"Como funcionam os alertas"**.

> ✅ 🔴 Abre uma **tela** com os quatro assuntos, o bloco "Depende do seu aparelho" e o link dos termos.
> ✅ O **botão físico de voltar** devolve ao formulário. O popup fecha junto — reabre com um toque.
> ✅ 🔴 Dali, toque em **"Ler os Termos de Uso completos"**: abre os termos, e voltar traz de volta
> à ajuda. Nada trava.
> ⚠️ **Mudou de propósito:** antes o popup reabria sozinho com o acordeão no ponto da leitura. Esse
> comportamento não existe mais — ele era contorno para a ajuda viver dentro de um modal.

**K. O visualizador de mídia** _(frente 11)_ 🔴. O anexo que existia para ser lido e não abria.

**K.1** **Remédios** → toque na **miniatura** de um remédio com foto.

> ✅ 🔴 A foto **amplia** sobre a lista, com fundo escurecido — sem trocar de tela.
> ✅ Sai tocando **fora**, no **X**, ou no **botão físico de voltar**.
> ✅ Tocar **na própria foto** não fecha.
> ✅ O título mostra o **nome do remédio**.

**K.2** **Cadastro** → toque no quadrado da **foto da caixa** já preenchido.

> ✅ 🔴 **Amplia** a foto. Antes abria o seletor de arquivo e não havia como só olhar.
> ✅ "Trocar foto da caixa", ao lado, continua trocando.
> ✅ Sem foto, o quadrado continua abrindo a escolha de origem.

**K.3** **Cadastro** → **RECEITA MÉDICA** com uma **foto** anexada, toque no quadrado.

> ✅ 🔴 Amplia, e a imagem aparece **inteira** — não cortada. Numa receita, a borda cortada pode ser
> a posologia escrita à mão.

**K.4** Agora anexe um **PDF** como receita e toque no quadrado.

> ✅ 🔴 Abre a **folha de compartilhamento do sistema**, e dá para abrir num leitor de PDF.
> ✅ Fechando a folha sem escolher nada, **nenhum erro** aparece.
> 🔬 Se disser "Não foi possível abrir", anote: significa que o aparelho não tem leitor de PDF.

**K.5** **Ficha de saúde** → toque na foto da ficha.

> ✅ Amplia. "Trocar foto" continua trocando.

**K.6** 🔬 **O alarme não tem visualizador, e isso é de propósito.** Com um alarme tocando, toque na
foto do remédio.

> ✅ 🔴 **Nada acontece.** Abrir uma camada por cima de um alarme daria uma saída que não responde
> a dose nenhuma.

---

## 9 — Acessibilidade com o TalkBack 🔬 (E1)

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

## 10 — Regressão: todas as telas

**Por que este bloco existe.** O passe de design mexeu em tipografia, cor, espaçamento, movimento e
no comportamento de todo elemento tocável. Nada disso é local: uma escala de fonte que mudou aparece
em telas que ninguém abriu de propósito para editar.

Percorra **todas** as telas procurando cinco coisas: **texto cortado**, **botão espremido**,
**contraste ruim**, **layout quebrado** e — agora — **algo que responde ao toque e não deveria, ou
não responde e deveria**.

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

**Depois, repita com a fonte do sistema no máximo** (Configurações → Tela → Tamanho da fonte).

🔬 **É aqui que altura travada aparece.** Duas varreduras já acharam o mesmo defeito em lugares
diferentes — sempre onde uma tela desenhou o próprio botão em vez de usar o do kit. Se algum texto
cortar, anote a tela e o elemento: é o mesmo padrão, e a correção é conhecida.

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

**É o bloco que fecha o C1 no plano.** Os blocos 1 a 4 provam que o alarme funciona quando tudo
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
> ❌ Se tocar, o cancelamento individual não alcançou o Notifee — é o mesmo risco do bloco 3, e o
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
depois de conferir que o bloco 5 (sincronização) já restaurou.

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
> existem mais — a explicação virou tela própria (bloco 12.9-J).

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
