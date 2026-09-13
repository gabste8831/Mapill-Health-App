# O que falta testar

> Documento de trabalho, criado em 12/09. Só o que ainda não foi validado em aparelho.
>
> O [`ROTEIRO-DE-TESTE.md`](ROTEIRO-DE-TESTE.md) continua sendo o registro completo — o que passou,
> quando, e o que cada achado revelou. Este aqui é a lista curta do que falta fazer.

## Resumo

**Tudo neste documento espera a build preview de 13/09.** A Parte A foi executada inteira em 13/09 e
saiu daqui — o que ela achou virou correção, e as correções estão listadas abaixo.

| O que conferir | Quantos |
|---|---|
| As correções de 11–12/09 (Parte B) | 13 itens |
| Os ajustes de 12/09 à tarde | 9 itens |
| **As correções de 13/09** | **5 itens** |
| Bugs conhecidos, ainda sem correção | 1 (C.2) |

> **Comece pelo D.1** (volume do alarme). Ele é o único item cuja correção não pôde ser verificada
> sem aparelho, e se ele falhar a leitura dos demais muda.

---

# PARTE D — As correções de 13/09

Saíram da rodada da Parte A, que fechou nesse dia. Quatro bugs corrigidos e um item de conferência.

| # | O que conferir | Como saber que passou |
|---|---|---|
| D.1 | 🔴 **O alarme sai no volume de despertador.** Zere o volume de **mídia** e o de **notificação**, deixe só o de **despertador** alto, e espere um alarme | Toca. Foi assim que o defeito apareceu em 13/09: com mídia zerada, não saía som — prova de que o alarme usava o stream de mídia. Confira também em `Ajustes → Diagnóstico`: a linha do canal agora diz `volume de despertador: patch aplicado` |
| D.2 | 🔴 **O alarme toca no silencioso e no Não perturbe** | Mesma correção do D.1 — o volume de despertador é o que o silencioso não corta. Se o D.1 passar e este falhar, é a permissão de política do Não Perturbe, não o canal |
| D.3 | 🔴 **O tratamento contínuo passa dos 30 dias.** Remédio de uso contínuo, hora automática desligada, relógio adiantado **31+ dias**, e então **feche e reabra o app** | A Home mostra a dose do dia **sem** você reabrir o cadastro. Antes, só salvar o cadastro de novo trazia as doses de volta. Adiante mais 31 dias e repita |
| D.4 | 🔴 **O horário não escorrega com o fuso.** Remédio às 16:00, troque o fuso para Manaus, **reabra o app** | Continua às 16:00 (não 15:00). Devolva o fuso, reabra, e confira de novo. A regeração roda na **abertura** — trocar o fuso com o app aberto só vale no próximo ciclo |
| D.5 | 🔴 **A tela azul sobe e fica.** App **fora dos recentes**, celular parado, tela bloqueada, alarme para daqui a alguns minutos | A tela azul aparece e **permanece** — não é trocada pela de "Hora do remédio". **Repita 3 ou 4 vezes, em momentos diferentes:** é uma corrida de tempo, e um acerto isolado não prova nada |

> **Sobre o D.5.** É o item mais frágil da lista e o que mais precisa de repetição. A correção
> anterior (12/09) falhava só no arranque frio — celular parado há horas, processo subindo do zero —,
> que é justamente o cenário de madrugada. Testar com o app recém-usado esconde o defeito.

**Não precisa testar:** o empilhamento de alarmes atrasados (dose vencida há mais de 4 h não irrompe
mais em tela cheia). Foi corrigido junto, por decisão do Gabriel em 13/09 não entra na fila de
validação — o cenário é raro e a falha, se houver, é recusar um alarme velho, não perder um atual.
Se ao adiantar o relógio no D.3 **não** aparecer pilha de telas azuis, é essa correção funcionando.

---

# PARTE B — Espera a próxima build

Oito correções entraram **depois** do APK instalado. Não adianta testar agora: o binário ainda tem
os defeitos.

| # | O que conferir | Commit |
|---|---|---|
| B.1 | Marcar "me avisar" **sem escolher prazo**, salvar, reabrir em editar → estoque → alterar: **a caixa continua marcada** | `8e85dfb` |
| B.2 | ✅ *Conferido em 12/09 no Diagnóstico* — o agendamento aparece e continua lá. Falta a **notificação chegar** (ver B.9) | `4cc90e6` `41640b4` |
| B.3 | Marcar o aviso **sem prazo**: o cartão aparece na tela inicial na semana em que o estoque acaba | `4cc90e6` |
| B.4 | Alarme → editar para notificação → salvar → voltar para alarme: **a tela azul sobe nas duas vezes** | `a3aa220` |
| B.5 | Cadastrar só aviso de estoque ou compromisso, **sem** alarme de dose, e negar a permissão de notificação: o painel da tela inicial aparece | `358e55c` |
| B.6 | `Ajustes → como funcionam os alertas`: há parágrafo próprio sobre o início automático, e o painel de permissões traz a nota do fabricante | `358e55c` |
| B.7 | **2 ou 3 remédios** no mesmo horário: a tela azul lista cada um com miniatura, nome, dose, orientação de tomada e local — tudo legível sem rolar | `930082a` `73df26a` |
| B.8 | **4 ou mais** no mesmo horário: a tela azul mostra só a contagem e o botão de abrir o app | `930082a` |
| B.9 | 🔴 **A notificação de estoque chega.** Cadastre um tratamento **com data de fim** (ex.: 7 dias) e estoque que dê conta dele, com antecedência de 3 dias. O aviso tem de chegar às 00:01 do dia previsto — e repita **sem** antecedência, onde só o aviso do dia em que acaba existe | `41640b4` |
| B.10 | Na tela de **Alertas e permissões**: as linhas têm fundo branco com sombra (não borda), sem itálico, e a seta cinza. Toque numa: ela abre a tela do sistema, e ao voltar o estado já está atualizado | `1f6fb56` `8554f0e` |
| B.11 | O bloco **"Confira as permissões"** aparece nas cinco telas que configuram algo dependente de autorização (lembrete de dose, estoque, compromisso, receita, medicamento) e fica **vermelho** enquanto o painel "Seus alarmes não vão funcionar" estiver na tela inicial | `78771dc` |
| B.12 | Na tela inicial: **não há** lista de permissões nem placar "2 de 3", e a seção "Autorizações do aparelho" no rodapé leva à tela de alertas | `26c557f` |
| B.13 | 🔴 **A tela de Alertas e permissões no tema escuro** e no alto contraste. Até 12/09 ela ignorava o tema por completo — texto claro sobre fundo claro. Vale trocar o tema em Ajustes e voltar nela | `1f6fb56` |

## Os sete ajustes de 12/09 (tarde)

Levantados pelo Gabriel usando a build `489a67a`. **Todos precisam de build nova.**

| # | O que conferir | Como saber que passou |
|---|---|---|
| B.14 | ➡️ **Virou D.1** — o teste de 13/09 mostrou que este ajuste não pegou, e a correção nova está lá | — |
| B.15 | ➡️ **Virou D.2**, pelo mesmo motivo | — |
| B.16 | O lembrete (modo notificação) **continua** no volume de aviso, e continua respeitando o silencioso | No mudo, o lembrete não toca — e isso é o correto. É a contraprova do D.1: se este também tocar no mudo, os dois canais viraram a mesma coisa |
| B.17 | ➡️ **Virou D.5** — a correção de 12/09 não fechou o caso, e há uma nova | — |
| B.17b | 🔴 **A contraprova do D.5**, que é onde o risco está: celular **desbloqueado**, usando outro app (navegador, WhatsApp), e o alarme dispara | Chega a notificação com som em loop, e **não** uma tela invisível. Se o som vier duplicado ou sem nada na tela, a guarda errou o caso e eu preciso saber |
| B.18 | Na seção de **lembretes** do cadastro de medicação, com permissões pendentes: aparece **um** bloco de permissão, não dois | Só o painel "Seus alarmes não vão funcionar", com o botão. Concedidas as verificáveis, ele dá lugar ao aviso azul |
| B.19 | No **tema escuro**, a opção de lembrete selecionada: o subtítulo do botão azul é legível | Texto claro sobre o azul. Antes era 2,08:1, escuro sobre escuro |
| B.20 | **4 ou mais remédios** no mesmo horário: a tela azul mostra nome e dose de cada um | Não há mais o vazio entre o horário e os botões |
| B.21 | Na tela **"Hora do remédio"**: foto, dose, orientação de tomada, **onde está guardado** e a observação do tratamento | Os dois últimos são novos. Cadastre um remédio com local e observação para conferir |
| B.22 | Na **lista de remédios**, um sino ao lado do nome de quem tem lembrete | Despertador para alarme, sino para notificação, nada para "nenhum aviso" |

E o **bloco 20 do estoque**, que depende de B.1 e B.9: cadastrar na véspera e conferir se a
notificação chega às 00:01.

---

# PARTE C — Bugs conhecidos, ainda sem correção

Estes dois **não** foram corrigidos. Você vai encontrá-los se testar, e é esperado — não são falha
da build nova.

Os quatro bugs que saíram da rodada de 13/09 (grade de 30 dias, fuso, tela azul, alarmes empilhados)
foram corrigidos e estão na **Parte D**, esperando validação.

## C.1 — 🔴 Responder o alarme dá acesso ao app sem desbloquear

Tela bloqueada, o alarme toca, a tela azul sobe. Ao tocar em "Tomei", o app fica acessível na tela
inicial **sem pedir desbloqueio**.

**Por que acontece:** o `showWhenLocked` é aplicado à MainActivity — o app inteiro — e o `index.js`
monta o app junto da tela do alarme. Fechar a tela azul revela o que estava atrás.

**Por que importa:** qualquer pessoa com o aparelho na mão pode esperar um alarme, tocar em "Tomei",
e chegar aos medicamentos, ao histórico de doses e à ficha de saúde. É exposição de dado sensível.

**A correção certa** é uma Activity nativa exclusiva do alarme, com `showWhenLocked` só nela. É
código nativo Android, e precisa de build para validar.

## C.2 — 🔴 Alarme adiado sobrevive ao apagamento de dados

Adiar um alarme e apagar todos os dados de saúde antes dos 5 minutos: ele toca mesmo assim.

**Investigado em 12/09, e é maior que o relatado:** `eraseHealthData` apaga tabelas e arquivos e
**não cancela agendamento nenhum**. Não é só o adiamento — as doses da grade também continuam
agendadas. É alarme órfão por um caminho que o bloco 16 não testa.

---

# Como reportar

Só o que falhar, com o número do passo:

```
D.1 falhou — com midia zerada nao saiu som
D.4 passou — 16:00 continuou 16:00 em Manaus
D.5 passou nas 4 tentativas
resto ok
```

Os passos marcados 🔴 valem anotar **mesmo quando passam** — são eles que fecham o C1 formalmente no
plano de desenvolvimento.

**No D.5, diga quantas vezes tentou.** "Passou" e "passou nas 4 tentativas" são informações
diferentes num defeito que é corrida de tempo: o primeiro não distingue correção de sorte.
