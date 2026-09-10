# Mapill — Inventário funcional e catálogo de avisos

> Levantado do código-fonte em 10/09/2026 para embasar a seção de Desenvolvimento do artigo.
> Toda afirmação traz arquivo e linha como evidência citável.
>
> Companion de `EMBASAMENTO-TECNICO.md` (arquitetura, LGPD, acessibilidade, cores) e
> `ROTEIRO-SECAO-DESENVOLVIMENTO.md` (estrutura do texto).

---

# 1. Inventário de funcionalidades

## 1.1 Início (Home)

A tela de abertura responde a uma pergunta só: **o que preciso fazer agora**. Ela lista as doses do
dia em ordem de horário, destacando a próxima e separando as atrasadas, e mostra cartões de alerta
quando algo exige atenção fora da rotina, como estoque acabando ou um compromisso próximo. As doses
da próxima e das atrasadas trazem os botões "Tomei" e "Pulei" na própria linha; as futuras não, e
isso é deliberado.

O problema que ela resolve é o da pessoa que toma vários remédios por dia e precisa saber, em dois
segundos e sem navegar, se está em dia. Também é onde o app avisa que falta autorizar alguma
permissão de alarme, num painel que aparece **antes** da agenda.

**Arquivo:** `src/telas/Inicio/InicioScreen.tsx` · **Rota:** `src/app/(abas)/index.tsx`

## 1.2 Cadastro de medicamento

É o formulário mais longo do app e o mais importante: nada funciona sem ele. A pessoa informa o
medicamento (digitando ou trazendo do scanner), a dose, a posologia (horários fixos, intervalo, ou
"só quando precisar"), o período de tratamento, e escolhe se quer alarme, notificação comum ou nenhum
aviso. Campos como estoque inicial, foto da caixa, receita e validade são opcionais e aparecem
conforme a escolha anterior os torna relevantes.

Resolve o problema de transformar uma prescrição médica — que chega em papel, com letra difícil e
vocabulário técnico — em agendamento que o sistema consegue executar. É de longe a tela com mais
regras de validação, porque um erro aqui se propaga para todos os alarmes daquele tratamento.

**Arquivos:** `src/telas/CadastroDeMedicamento/FormularioDeMedicamentoScreen.tsx`,
`ConfiguracaoDeLembrete.tsx`, `SeletorDeHorarios.tsx` · **Rotas:** `src/app/cadastro/medicamento.tsx`,
`manual.tsx`, `editar/[id].tsx`

## 1.3 Scanner de código de barras

Lê o código de barras da caixa do medicamento pela câmera e busca o produto num catálogo local
derivado da tabela CMED (~7 mil registros embarcados no app). Quando encontra, leva a pessoa ao
formulário de cadastro **já preenchido** com nome comercial, princípio ativo, dosagem e exigência de
receita; quando não encontra, oferece a entrada manual.

O ponto central é que **nada é salvo sem revisão**: o scanner sugere, a pessoa confirma. Resolve a
digitação de nomes longos e propensos a erro ("Hidroclorotiazida 25mg") sem transferir ao
reconhecimento automático a responsabilidade por um dado clínico.

**Arquivo:** `src/telas/Scanner/ScannerScreen.tsx` · **Rota:** `src/app/cadastro/scanner.tsx` ·
**Catálogo:** `src/data/local/importar-cmed.ts`

## 1.4 Lista de medicamentos (Remédios)

Mostra todos os tratamentos cadastrados, com busca por nome e três ordenações: alfabética, mais
recentes, e "acabando" (por estoque). Cada item abre um detalhe com a posologia completa, a foto da
caixa, os dados da receita e atalhos para editar ou excluir.

Resolve a consulta pontual — "qual é mesmo a dose daquele remédio?" — que é diferente da pergunta da
Home. A busca ignora acentos e maiúsculas, para "acido folico" encontrar "Ácido fólico".

**Arquivo:** `src/telas/Remedios/RemediosScreen.tsx` · **Rota:** `src/app/(abas)/remedios.tsx`

## 1.5 Controle de estoque

Lista quanto resta de cada medicamento e, principalmente, **por quanto tempo isso ainda dá**. Cada
cartão traz a previsão de duração calculada a partir da posologia real, um selo de prazo em três
estados, e botões para ajustar a quantidade após uma recontagem ou uma compra. A pessoa também
configura ali se quer ser avisada quando o estoque estiver acabando e com quantos dias de
antecedência.

O problema resolvido é o da falta que só se descobre na hora de tomar. A tela converte "restam 8
comprimidos" em "acaba em 4 dias", que é a forma que permite decidir se dá para esperar a próxima ida
à farmácia.

**Arquivo:** `src/telas/Estoque/EstoqueScreen.tsx` · **Rota:** `src/app/estoque.tsx` ·
**Algoritmo:** `src/domain/use-cases/estimate-stock-depletion.ts:48`

## 1.6 Calendário / Agenda

Apresenta a linha do tempo do tratamento: o que vem primeiro e, abaixo, o que já passou. Tem um
filtro de três posições — tudo, só compromissos, só remédios — e tocar num dia abre o detalhe daquele
dia. Não é uma grade mensal, e a decisão está justificada no código.

Resolve a pergunta "o que é o próximo, e quando", que uma grade de mês responde mal: seria preciso
navegar entre meses para descobrir que a próxima consulta é só em outubro.

**Arquivo:** `src/telas/Calendario/CalendarioScreen.tsx` · **Rota:** `src/app/(abas)/calendario.tsx`

## 1.7 Compromissos clínicos

Cadastro e lista de consultas, exames e retornos. Cada compromisso tem título, data, hora, local,
profissional e uma cascata de lembretes configurável: avisar com X dias de antecedência, avisar
também na manhã do próprio dia, ou ambos. Depois que o compromisso passa, a pessoa registra o
desfecho ("fui" / "não fui"), e ele migra para um acordeão de anteriores.

Resolve o esquecimento de consulta marcada com meses de antecedência — e alimenta o relatório em PDF
que vai para o médico.

**Arquivos:** `src/telas/Compromissos/CompromissosScreen.tsx`,
`src/telas/CadastroDeCompromisso/FormularioDeCompromissoScreen.tsx` · **Rotas:**
`src/app/compromissos.tsx`, `src/app/cadastro/compromisso.tsx`, `editar-compromisso/[id].tsx`

## 1.8 Relatório de adesão

Mostra a taxa de adesão do período escolhido (7, 30 ou 90 dias), o número de doses confirmadas,
puladas e sem resposta, uma tabela por medicamento e uma faixa com os últimos sete dias. Abaixo, a
pessoa gera um **PDF** com os tratamentos, a adesão e os compromissos, escolhendo o que entra no
documento.

É a tela que transforma o app de lembrete em registro clínico: sem ela, todo o dado de ingestão fica
invisível para quem tomaria decisão a partir dele. Deliberadamente **não julga** — não há parabéns,
meta nem alerta por adesão baixa.

**Arquivo:** `src/telas/Adesao/AdesaoScreen.tsx` · **Rota:** `src/app/adesao.tsx` ·
**Geração do PDF:** `src/data/repositories/gerar-relatorio-pdf.ts`

## 1.9 Ficha de saúde

Central de anotações clínicas de acesso rápido: tipo sanguíneo, alergias, condições crônicas,
convênio, contatos de emergência e foto do paciente. Cada contato de emergência só entra na lista
depois de completo, nunca pela metade.

Resolve a situação em que alguém — a própria pessoa ou quem a socorre — precisa de um dado clínico
imediatamente e não tem onde procurar. **Não é insumo do tratamento**: o app não usa esses dados para
calcular nada, eles existem para serem lidos por um humano.

**Arquivo:** `src/telas/FichaDeSaude/FichaDeSaudeScreen.tsx` · **Rota:** `src/app/ficha.tsx`

## 1.10 Tela do horário

Aberta ao tocar no corpo de uma notificação de dose, ou pela agenda. Lista as doses daquele horário,
uma linha por medicamento, com "Tomei" e "Pulei" em cada, mais a saída "Ignorar por agora".

Existe porque **o aviso é por horário, não por dose**: com dois remédios às 08:00, o botão "Tomei
todas" da notificação resolve o caso comum, mas quem tomou um e não o outro não tem como dizer isso
num botão. Esta é a única tela onde a resposta parcial cabe sem ambiguidade.

**Arquivo:** `src/telas/Horario/HorarioScreen.tsx` · **Rota:** `src/app/horario/[instante].tsx`

## 1.11 Alarme em tela cheia

Irrompe sobre a tela de bloqueio no horário da dose, com o nome do medicamento, a quantidade, a foto
da caixa e som em loop. Oferece quatro saídas: Tomei, Pulei, Adiar e dispensar.

Resolve o caso em que a notificação comum não basta — a dose que não pode ser perdida. É a promessa
central do app, e a única funcionalidade que exige três permissões especiais do Android.

**Arquivos:** `src/telas/Alarme/AlarmeScreen.tsx`, `AlarmeRaiz.tsx` · **Rota:**
`src/app/alarme/[instante].tsx`

## 1.12 Diagnóstico de avisos

Ferramenta de desenvolvimento que mostra, em cinco segundos, o estado real do subsistema de
notificações: permissões concedidas, configuração dos canais (som e importância), e a comparação
entre os avisos **agendados no sistema** e os **esperados pelo banco**. Tem botões que disparam cada
tipo de aviso em 30 segundos.

Resolve o problema de diagnosticar um alarme que não tocou: antes dela, era preciso esperar o horário
e adivinhar a causa.

**Arquivo:** `src/telas/Diagnostico/DiagnosticoScreen.tsx` · **Rota:** `src/app/diagnostico.tsx` ·
**Lógica:** `src/notifications/diagnostico-de-avisos.ts`

## 1.13 Telas de apoio

| Tela | O que faz | Arquivo | Rota |
|---|---|---|---|
| **Ajustes** | Tema, permissões, conta, acesso ao diagnóstico | `src/telas/Ajustes/AjustesScreen.tsx` | `src/app/(abas)/ajustes.tsx` |
| **Tema** | Escolha entre padrão, escuro, alto contraste e daltonismo | `src/telas/Tema/TemaScreen.tsx` | `src/app/tema.tsx` |
| **Conta** | Login, vínculo com a nuvem, exportar e apagar dados | `src/telas/Conta/ContaScreen.tsx` | `src/app/conta.tsx` |
| **Consentimento** | Aceite obrigatório antes de qualquer dado clínico | `src/telas/Consentimento/ConsentimentoScreen.tsx` | — (gate) |
| **Termos** | Política de privacidade e termos de uso | `src/telas/Termos/TermosScreen.tsx` | `src/app/termos.tsx` |
| **Ajuda de alertas** | Explica o que cada aviso faz e do que depende | `src/telas/AjudaDeAlertas/AjudaDeAlertasScreen.tsx` | `src/app/cadastro/ajuda-de-alertas.tsx` |
| **Escolha de cadastro** | Bifurcação entre scanner e entrada manual | `src/telas/EscolhaDeCadastro/EscolhaDeCadastroScreen.tsx` | `src/app/cadastro/escolha.tsx` |
| **Login** | Autenticação opcional (Supabase) | `src/telas/Login/` | — |

---

# 2. Catálogo completo de lembretes e avisos

## 2.1 Os dois canais do Android

O app cria **dois** canais de notificação, e a diferença entre eles é o que separa "isto pode
esperar" de "isto não pode".

| | `CANAL_ALARME` | `CANAL_LEMBRETE` |
|---|---|---|
| **ID** | `dose-alarm-v5` | `dose-reminder-v5` |
| **Importância** | HIGH | HIGH |
| **Som** | `alarme_de_dose` (arquivo próprio, em loop) | `default` (som do sistema) |
| **Ignora Não Perturbe** | **Sim** (`bypassDnd: true`) | Não |
| **Tela cheia** | Sim (`fullScreenAction`) | Não |
| **Persistente** | Sim (`ongoing: true`, `autoCancel: false`) | Não |

**Evidência:** `src/notifications/canais-notifee.ts:28-29` (ids), `:94-100` (recriação),
`:103-148` (definição completa).

> **Nota técnica citável no artigo:** o canal de lembrete precisou de `sound: "default"` explícito.
> Omitir o campo **cria o canal mudo**, contrariando a documentação do Notifee, que afirma o
> oposto. O comportamento foi confirmado em aparelho (`canais-notifee.ts:138-148`). Como um canal já
> criado fica congelado no Android — som e importância não mudam por atualização —, os ids carregam
> sufixo de versão (`-v5`) e há uma função que recria o canal quando ele diverge do esperado
> (`recriarSeDivergente`, `canais-notifee.ts:66`).

## 2.2 Alarme de dose

| | |
|---|---|
| **Disparo** | No horário exato da dose agendada |
| **Tipo** | **Alarme de tela cheia**, som em loop, ignora o modo silencioso |
| **Ações rápidas** | "Tomei" / "Tomei todas", "Pulei" / "Pulei todas" |
| **Adiar** | Só na tela do alarme, não na notificação |
| **Planejamento** | `src/domain/use-cases/planejar-avisos-de-dose.ts:99` |
| **Agendamento** | `src/notifications/notifee-gateway.ts:306` (`createTriggerNotification`) |
| **Tela cheia** | `notifee-gateway.ts:349` (`fullScreenAction`) |
| **Ações** | `notifee-gateway.ts:191-192` (`acoesDoAviso`) |
| **Resposta** | `src/notifications/responder-aviso.ts` |

O modo é escolhido **por tratamento**, no cadastro: `alarm`, `notification`, `both` ou `none`
(`src/domain/entities/prescription.ts:24`). O comentário registra o critério clínico: *"insulina pede
alarme, suplemento de rotina pode ser só notificação ou nada"*.

O texto plural ("Tomei todas") aparece quando o horário tem mais de uma dose — os botões são montados
na hora, a partir do aviso.

## 2.3 Lembrete de dose (notificação comum)

| | |
|---|---|
| **Disparo** | No horário exato da dose |
| **Tipo** | Notificação comum, som padrão, respeita o modo silencioso |
| **Ações rápidas** | "Tomei" / "Tomei todas", "Pulei" / "Pulei todas" |
| **Adiar** | **Removido daqui de propósito** (ver §4.3) |
| **Evidência** | `notifee-gateway.ts:319` (escolha do canal por `aviso.modo`) |

## 2.4 Lembrete de compromisso

| | |
|---|---|
| **Disparo** | X dias antes (configurável) e/ou na manhã do próprio dia |
| **Horário de entrega** | **00:01** do dia do aviso |
| **Tipo** | Notificação comum |
| **Ações rápidas** | Nenhuma; tocar abre a tela do compromisso |
| **Supressão** | Compromisso já respondido ("fui"/"não fui") não gera aviso |
| **Evidência** | `src/domain/use-cases/planejar-avisos-de-compromisso.ts:144` |

A antecedência (`reminderLeadDays`) e o aviso do próprio dia (`reminderOnDay`) são independentes: a
pessoa pode pedir um, outro ou os dois.

## 2.5 Renovação de receita

| | |
|---|---|
| **Disparo** | X dias antes do vencimento **e/ou** no dia do vencimento |
| **Horário de entrega** | 00:01 |
| **Tipo** | Notificação comum |
| **Ações rápidas** | Nenhuma |
| **Evidência** | `planejar-avisos-de-compromisso.ts:202-243` |

Dois avisos com papéis distintos, e o código explica a diferença: *"o antecipado dá tempo de marcar a
consulta que renova a receita. O do próprio dia é o que diz que a partir de agora a receita não vale
mais"*. O segundo só é emitido quando os dois não caem no mesmo dia.

**Decisão não-óbvia:** `querAviso` e `renewalReminderLeadDays` são campos **separados**. Marcar a
caixa sem escolher prazo antes produzia **silêncio total** — nem o aviso do vencimento chegava
(`planejar-avisos-de-compromisso.ts:31-40`).

## 2.6 Estoque acabando

| | |
|---|---|
| **Disparo** | (a) quando a previsão entra na janela de antecedência pedida; (b) quando a previsão chega a zero |
| **Horário de entrega** | 00:01 |
| **Tipo** | Notificação comum |
| **Ações rápidas** | Nenhuma |
| **Frequência** | No máximo dois por estoque, cada um **uma vez só** |
| **Evidência** | `src/domain/use-cases/planejar-avisos-de-estoque.ts:95` |

**A regra anti-repetição é elegante e vale citar.** O sistema guarda a quantidade que havia no momento
do aviso (`quantidadeQuandoAvisou`) e só volta a avisar quando a quantidade **aumenta** — isto é,
quando a pessoa repôs o estoque:

```ts
function precisaAvisar(estoque: EstoqueAAvisar): boolean {
  if (estoque.quantidadeQuandoAvisou === null) return true;
  return estoque.quantidadeAtual > estoque.quantidadeQuandoAvisou;
}
```
`planejar-avisos-de-estoque.ts:76-79`

Sem isso, o aviso se repetiria todo dia enquanto o estoque estivesse baixo, que é o caminho mais curto
para a pessoa desligar as notificações do app.

O comentário registra ainda que **o cartão da Home é o canal garantido**, porque não depende de
permissão de notificação e mostra o estado atual em vez de um instante passado
(`planejar-avisos-de-estoque.ts:91-93`).

## 2.7 Por que 00:01, e não uma hora "civilizada"

Compromisso, receita e estoque são entregues **à meia-noite e um minuto** do dia do aviso. A
justificativa está em `planejar-avisos-de-compromisso.ts:58`:

> *"00:01 é a única hora que serve para o dia inteiro, porque este aviso não é para ser ouvido na
> hora."*

Diferente do alarme de dose, que interrompe, estes avisos são para serem **encontrados** quando a
pessoa pegar o telefone. Qualquer hora fixa da manhã excluiria quem acorda antes ou depois dela.

**Implicação prática para o teste em aparelho:** marcar um compromisso para *hoje* não dispara nada,
porque 00:01 de hoje já passou. Só o alarme de dose toca na hora marcada.

## 2.8 Aviso adiado

| | |
|---|---|
| **Disparo** | 5 minutos após o toque em "Adiar" |
| **Limite** | **Um adiamento por horário** (`snoozeCount`) |
| **Registro** | **Nenhum** — não grava desfecho, nem `deferred` |
| **Evidência** | `src/notifications/responder-aviso.ts:111` (`adiarAviso`), `src/notifications/acoes.ts:43` (`MINUTOS_DE_ADIAMENTO`) |

O aviso que volta traz só o que ainda estiver pendente, e **não oferece adiar de novo**.

---

# 3. Mapeamento de telas para captura

Ordem sugerida para os prints do artigo, com a figura correspondente do roteiro:

| Prioridade | Tela | Arquivo | Serve para |
|---|---|---|---|
| **Alta** | Início | `Inicio/InicioScreen.tsx` | Visão geral; agenda do dia |
| **Alta** | Alarme em tela cheia | `Alarme/AlarmeScreen.tsx` | Seção do alarme (Figura 4) |
| **Alta** | Estoque | `Estoque/EstoqueScreen.tsx` | Previsão de duração (Figura 3) |
| **Alta** | Adesão | `Adesao/AdesaoScreen.tsx` | Registro clínico; relatório |
| **Alta** | Três temas lado a lado | `Tema/TemaScreen.tsx` + Home nos 3 temas | Acessibilidade (Figura 5) |
| Média | Diagnóstico | `Diagnostico/DiagnosticoScreen.tsx` | Instrumentação (Figura 6) |
| Média | Cadastro de medicamento | `CadastroDeMedicamento/FormularioDeMedicamentoScreen.tsx` | Revelação progressiva |
| Média | Tela do horário | `Horario/HorarioScreen.tsx` | Resposta parcial por dose |
| Baixa | Scanner | `Scanner/ScannerScreen.tsx` | CMED; confirmação humana |
| Baixa | Ficha de saúde | `FichaDeSaude/FichaDeSaudeScreen.tsx` | Dados sensíveis; LGPD |
| Baixa | Calendário | `Calendario/CalendarioScreen.tsx` | Linha do tempo |
| Baixa | Consentimento | `Consentimento/ConsentimentoScreen.tsx` | LGPD (art. 7º e 11) |

---

# 4. Decisões de projeto não-óbvias

Reunidas com o comentário original do código, para citação direta no artigo.

## 4.1 A previsão de estoque se recusa a responder

`src/domain/use-cases/estimate-stock-depletion.ts:44`

> *"Também `null` quando estoque e dose não são contados na mesma unidade. Gota se toma em gota e se
> compra em ml, e converter exigiria a concentração do frasco, que o app não tem. Subtrair '3 gotas'
> de '20 ml' produz um número que parece uma previsão e não é nenhuma."*

E há uma segunda lição no mesmo comentário, sobre onde a validação deve morar:

> *"A unidade entra na assinatura por isso: a checagem já existia no formulário, e as duas outras
> telas que passaram a chamar esta função esqueceram dela. Regra que dá para esquecer é regra que vai
> ser esquecida."*

A função também percorre as doses reais em vez de dividir quantidade pela dose, porque a divisão erra
com dose variável por horário e com ciclos que têm dias de pausa (cartela 21/7).

## 4.2 "Adiar" não registra desfecho nenhum

`src/notifications/acoes.ts:10-17`

> *"Adiar não registra nada. Ele só reagenda o aviso; nenhum log é gravado, nem `deferred`. Isso
> importa quando o horário tem mais de uma dose: quem tomou uma e não a outra não está afirmando nada
> sobre nenhuma delas ao adiar, está dizendo 'me lembra de novo'. Registrar um desfecho ali inventaria
> uma resposta que ninguém deu."*

## 4.3 "Adiar" saiu da notificação, mas ficou no alarme

`src/notifications/notifee-gateway.ts:178-184`

> *"Ele fazia sentido no alarme, que interrompe e pode pegar alguém longe do remédio; a notificação é
> o modo de quem não quer ser interrompido, e adiar um aviso discreto é resolver com dois toques o
> que um toque já resolve."*

Há ainda uma restrição de plataforma citável: o Android mostra no máximo **três** ações, e "Adiar 5
min" era a mais larga das três.

## 4.4 Um adiamento por horário

`src/notifications/responder-aviso.ts:104` e `:118`

A trava nasceu de um defeito real: **cinco toques em "Adiar" produziam cinco lembretes**, porque cada
toque disparava o handler outra vez. Num app de adesão, adiamento infinito é a falha silenciosa mais
provável — a pessoa empurra o alarme indefinidamente e o app registra adesão que não houve.

## 4.5 Dose futura não oferece botão de confirmar

`src/telas/Inicio/componentes/ItemDeDose/ItemDeDose.tsx`

> *"Só a próxima e as atrasadas mostram botões: oferecer 'confirmar' numa dose das 22h às 8 da manhã
> faria o app registrar intenção em vez de ingestão."*

## 4.6 "Tomei" na notificação pula a confirmação visual — e por que é aceitável

`src/notifications/acoes.ts:4-8`

> *"Isso pula a confirmação visual que o projeto exige para ações críticas, e é uma exceção
> consciente: tocar num botão rotulado 'Tomei' já é uma ação deliberada, e a fricção extra num app de
> adesão custa exatamente o que ele existe para conseguir, doses registradas. O que torna a exceção
> aceitável é a Home oferecer correção óbvia."*

Em termos das heurísticas de Nielsen: tensão entre **prevenção de erros** (H5) e **flexibilidade e
eficiência** (H7), resolvida por **controle e liberdade do usuário** (H3) — a saída rápida é permitida
porque o desfazer existe.

## 4.7 O botão "Pulei" foi acrescentado para não falsear o relatório

`src/notifications/acoes.ts:31-38`

> *"A notificação oferecia 'Tomei' e 'Adiar', o que dava saída para quem tomou e para quem quer ser
> lembrado depois, mas nenhuma para quem não tomou. Registrar isso importa tanto quanto o contrário: o
> relatório distingue 'pulada' de 'sem registro', e sem este botão a dose não tomada caía no segundo
> caso por falta de caminho, não por escolha."*

## 4.8 A tela de adesão não julga

`src/telas/Adesao/AdesaoScreen.tsx`

> *"A tela não julga: sem 'parabéns', sem alerta por adesão baixa, sem meta. Elogiar ou repreender
> convida a corrigir o registro em vez do tratamento, e é o que destruiria o valor do número."*

As faixas de cor (verde/amarelo/vermelho) valem **só na lista por medicamento**, onde a cor aponta
para uma ação: qual tratamento está falhando.

## 4.9 A faixa de sete dias não acompanha o período escolhido

`src/telas/Adesao/AdesaoScreen.tsx`

> *"Sempre sete dias, mesmo com 30 ou 90 escolhido acima: 'qual dia falhou' só se responde enquanto a
> pessoa lembra do dia. A janela é de leitura, não de retenção."*

Os dados **não expiram** — a limitação é de apresentação, não de armazenamento. Importante dizer isso
no artigo para não sugerir descarte de dado.

## 4.10 Lista vazia significa "todos"

`src/telas/Adesao/AdesaoScreen.tsx`

No filtro do relatório em PDF, a ausência de seleção é guardada como **lista vazia**, e não como
"todos os ids marcados". A consequência: um medicamento cadastrado depois entra no relatório
sozinho — com a lista cheia, ele nasceria fora e ninguém entenderia por quê.

## 4.11 O calendário é lista, não grade

`src/telas/Calendario/CalendarioScreen.tsx`

> *"Não é uma grade de mês. O calendário mensal mostra bem a distribuição, mas a pergunta que se faz
> abrindo esta tela é 'o que é o próximo, e quando', e uma lista responde isso sem precisar navegar
> entre meses para descobrir que o próximo compromisso é só em outubro."*

## 4.12 O scanner sugere, a pessoa confirma

`src/telas/Scanner/ScannerScreen.tsx`

> *"Nada é salvo sem revisão. O scanner encontra e mostra o que achou; quem confirma é a pessoa, e o
> destino é o mesmo formulário de sempre, já preenchido no que a base sabe."*

## 4.13 Contato de emergência nunca fica pela metade

`src/telas/FichaDeSaude/FichaDeSaudeScreen.tsx`

> *"Cada contato só entra na lista depois de completo, nunca existe um contato salvo pela metade."*

Num dado de emergência, registro incompleto é pior que registro ausente: passa a impressão de que há
alguém para chamar.

## 4.14 A janela de agendamento existe por limite de sistema operacional

`src/domain/use-cases/planejar-avisos-de-dose.ts:34-37`

> *"A janela existe porque '3x ao dia por 6 meses' são 540 avisos para uma prescrição, e um paciente
> polimedicado passaria de 2.500, acima do que qualquer sistema operacional aceita manter pendente. A
> janela é reabastecida a cada abertura do app."*

Boa evidência para a seção de arquitetura: uma restrição de plataforma que molda o desenho do domínio.

## 4.15 O modo "both" foi removido

`src/domain/entities/prescription.ts:10-16`

Emitia alarme **e** notificação para o mesmo horário. Saiu porque a redundância que prometia já existe
sem ele: o alarme é criado com `ongoing: true`, então persiste até ser respondido.

## 4.16 Nomes de campo abreviados no catálogo CMED

`src/data/local/importar-cmed.ts:7-11`

> *"Chaves de uma letra porque são 7 mil registros: `{"name":…,"activeIngredient":…}` custaria ~300 KB
> a mais no bundle só em nomes de campo repetidos. É a única parte do projeto onde abreviação se
> justifica: o arquivo é gerado por script e lido em um lugar só."*

Exemplo citável de otimização com escopo delimitado e justificativa explícita.

---

# 5. Observações para a escrita

1. **O catálogo de avisos (§2) é material de tabela**, não de prosa. Uma tabela única com as colunas
   *aviso · disparo · tipo · ações · arquivo* comunica melhor que seis parágrafos.

2. **§4 é a matéria-prima da seção "Decisões de projeto"** do roteiro. Cada item já tem problema,
   decisão e justificativa; falta acrescentar o **custo** de cada uma, que é o que o roteiro
   recomenda (§1.2 daquele documento).

3. **O fio condutor aparece de novo aqui.** §4.1 (previsão que retorna `null`), §4.2 (adiar não
   grava), §4.5 (dose futura sem botão), §4.7 (distinguir pulada de sem registro) e §4.13 (contato
   completo ou nenhum) são a mesma diretriz: *o sistema prefere a ausência de dado ao dado
   inventado.*

4. **Cuidado com uma afirmação:** o app **não** usa `expo-notifications`, apesar de o pacote constar
   no `package.json`. Ver §0 do `EMBASAMENTO-TECNICO.md`.
