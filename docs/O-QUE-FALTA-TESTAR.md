# O que falta testar

> Documento de trabalho, criado em 12/09. Só o que ainda não foi validado em aparelho.
>
> O [`ROTEIRO-DE-TESTE.md`](ROTEIRO-DE-TESTE.md) continua sendo o registro completo — o que passou,
> quando, e o que cada achado revelou. Este aqui é a lista curta do que falta fazer.

## Resumo

| | Quantos | Precisa de build nova? |
|---|---|---|
| Casos de borda do alarme (bloco 19) | 7 passos | Não |
| Bateria (18.3) | 1 passo | Não |
| As correções de 11–12/09 | 13 itens | **Sim** |
| Os sete ajustes de 12/09 (tarde) | 9 itens | **Sim** |
| Bugs conhecidos, ainda sem correção | 2 | — |

> **Build de 12/09 (preview, com Diagnóstico).** Ela fecha a Parte B inteira. O agendamento do aviso
> de estoque já foi conferido no Diagnóstico pelo Gabriel em 12/09 — o que falta é a notificação
> **chegar** no aparelho, que é outra coisa e nunca foi vista.

---

# PARTE A — Dá para testar agora

Com o APK que está instalado. **O Autostart precisa estar ligado** (Configurações → Apps →
Gerenciar apps → Mapill → Autostart), e reinstalar o app o desliga de novo.

## A.1 — Dose já confirmada não toca

1. Cadastre `Tomei Antes`, alarme para **daqui a 4 min**
2. Na tela inicial, **confirme essa dose** antes da hora
3. Feche o app e espere o horário passar

✅ **Nada toca** — nem tela cheia, nem notificação.

❌ Se tocar, o cancelamento individual não alcançou o agendador. É alarme órfão pelo caminho da
Home, e não pela edição do cadastro.

## A.2 — Dois horários atravessando a meia-noite

1. Cadastre `Meia Noite` com **dois horários**: `23:50` e `00:10`
2. Olhe a tela inicial

✅ A dose das `00:10` aparece **no dia seguinte**, não hoje.

Se não quiser esperar a virada, mude para daqui a 3 e 8 min e confirme que os dois tocam.

## A.3 — Não perturbe, e depois o mudo

1. Cadastre `Silencioso`, alarme para **daqui a 3 min**
2. Ative o **Não perturbe** do Android
3. Feche o app e bloqueie a tela

✅ **Toca mesmo assim.** O app promete "toca alto, mesmo no silencioso".

Depois **repita** com o celular no **mudo** (botão de volume, não o Não perturbe).

✅ Toca igual.

> Anote os dois separadamente: eles falham por motivos diferentes. Se o Não perturbe silenciar, é a
> permissão de política de notificação; se o mudo silenciar, é o canal.

## A.4 — 🔴 O tratamento contínuo sobrevive a 30 dias?

**O passo mais importante deste documento.** Ele responde uma dúvida achada por leitura de código,
não por teste.

As doses são gravadas no banco em blocos de **30 dias**. O comentário do `SCHEDULE_HORIZON_DAYS` diz
que a janela "é reabastecida depois", mas não foi encontrado código que faça isso.

1. Cadastre um remédio de **uso contínuo**, 1x ao dia
2. Nas configurações do Android, **desligue a hora automática**
3. **Adiante o relógio 31 dias**
4. Volte à tela inicial do app

✅ A tela inicial **continua mostrando a dose do dia**.

❌ **Se ficar vazia, a suspeita se confirma** — e é o pior modo de falhar deste app: os avisos param
por volta do 30º dia, e nada denuncia. Anote com destaque.

*(Deixe a hora adiantada, o passo seguinte aproveita.)*

## A.5 — Relógio mudado à mão

1. Cadastre `Relogio`, alarme para **daqui a 2 h**
2. Feche o app
3. Com a hora automática desligada, adiante o relógio para **5 min antes** do horário da dose
4. Espere

✅ O aviso chega no horário **do relógio novo**.

⚠️ Se não chegar, abra o app e veja se ele chega então. Isso decide se o app precisa reagir à
mudança de relógio ou se basta a próxima abertura.

## A.6 — Fuso horário

1. Com a hora automática ainda desligada, mude o **fuso** para um vizinho (Fortaleza ou Manaus)
2. Abra o app

✅ A dose das 08:00 **continua às 08:00**. Quem toma remédio às 8 da manhã toma às 8 da manhã em
qualquer lugar — o horário é uma promessa sobre o relógio de parede, não um instante absoluto.

❌ Se escorregar para 07:00 ou 09:00, é o defeito mais sutil deste bloco.

**Devolva o fuso e a hora automática ao terminar.**

## A.7 — App reinstalado

1. Com um alarme cadastrado para algumas horas à frente, **desinstale o Mapill**
2. **Instale de novo** e **não abra**
3. Espere o horário

✅ **Nada chega** — e isso é o correto: desinstalar leva os agendamentos junto.

4. ⚠️ **Religue o Autostart** (a reinstalação o desligou)
5. Abra o app **uma vez** e feche

✅ A partir daí os avisos **voltam a chegar**, sem reeditar nada.

❌ Se não voltarem, existe um caminho em que a pessoa fica sem lembrete nenhum e sem nenhum sinal
disso.

> Este passo apaga os dados locais se não houver conta vinculada. Faça-o por último.

## A.8 — Bateria (o teste da noite)

1. Deixe um alarme para **daqui a 8–12 h** (a noite serve)
2. Celular **sem carregador**, app fechado, economia de bateria do fabricante ativa

🔬 Chegou? No horário ou atrasado?

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
| B.14 | 🔴 **O alarme sai no volume de despertador.** Com o alarme tocando, aperte o volume: o controle que aparece tem de ser o do **relógio**, não o de mídia | O ícone no controle de volume é um despertador |
| B.15 | 🔴 **O alarme toca no silencioso.** Celular no mudo pelo botão de volume, alarme para daqui a 3 min | Toca alto mesmo no mudo. É a mesma correção do B.14: o volume de despertador é o que o silencioso não corta |
| B.16 | O lembrete (modo notificação) **continua** no volume de aviso, e continua respeitando o silencioso | No mudo, o lembrete não toca — e isso é o correto |
| B.17 | 🔴 **A tela azul com o app nos recentes.** Bloqueie o celular com o Mapill **aberto nos recentes** e espere o alarme | A tela azul sobe igual. Antes, só subia com o app fora dos recentes |
| B.17b | 🔴 **A contraprova do B.17**, que é onde o risco está: celular **desbloqueado**, usando outro app (navegador, WhatsApp), e o alarme dispara | Chega a notificação com som em loop, e **não** uma tela invisível. Se o som vier duplicado ou sem nada na tela, a espera errou o caso e eu preciso saber |
| B.18 | Na seção de **lembretes** do cadastro de medicação, com permissões pendentes: aparece **um** bloco de permissão, não dois | Só o painel "Seus alarmes não vão funcionar", com o botão. Concedidas as verificáveis, ele dá lugar ao aviso azul |
| B.19 | No **tema escuro**, a opção de lembrete selecionada: o subtítulo do botão azul é legível | Texto claro sobre o azul. Antes era 2,08:1, escuro sobre escuro |
| B.20 | **4 ou mais remédios** no mesmo horário: a tela azul mostra nome e dose de cada um | Não há mais o vazio entre o horário e os botões |
| B.21 | Na tela **"Hora do remédio"**: foto, dose, orientação de tomada, **onde está guardado** e a observação do tratamento | Os dois últimos são novos. Cadastre um remédio com local e observação para conferir |
| B.22 | Na **lista de remédios**, um sino ao lado do nome de quem tem lembrete | Despertador para alarme, sino para notificação, nada para "nenhum aviso" |

E o **bloco 20 do estoque**, que depende de B.1 e B.9: cadastrar na véspera e conferir se a
notificação chega às 00:01.

---

# PARTE C — Bugs conhecidos, ainda sem correção

Estes dois **não** foram corrigidos. Você vai encontrá-los se testar, e é esperado.

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
A.3 falhou — o Não perturbe silenciou o alarme
A.4 passou — a Home continuou mostrando a dose depois de 31 dias
resto ok
```

Os passos marcados 🔴 valem anotar **mesmo quando passam** — são eles que fecham o C1 formalmente no
plano de desenvolvimento.
