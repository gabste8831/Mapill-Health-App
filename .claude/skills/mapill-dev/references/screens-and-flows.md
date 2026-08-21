# Telas e Fluxos — Mapill

Este arquivo documenta as telas do app: as já definidas pelo usuário (com protótipo visual) e
as que ainda precisam ser desenhadas/especificadas. Manter este arquivo atualizado conforme o
design evolui — é a ponte entre o protótipo visual e a implementação em `presentation/screens`.

Perfil de conta: **conta única por paciente**. Um eventual cuidador/familiar acompanha através
da mesma conta (sem tela de login/perfil separada, sem papel de usuário duplo no modelo de
dados). Não implementar lógica de múltiplos usuários por registro.

---

## Telas definidas (protótipo existente)

### 1. Home / Dashboard diário — ✅ Definida (referência principal de tom visual)
- Header "Olá, {Nome}" + ícone de perfil (acesso a Conta/Configurações).
- Card de "Próxima Dose" em destaque (fundo `colors.primary`, texto grande) — nome do
  medicamento, dose, horário, e uma dica textual (ex: "tomar com bastante água").
- Barra de progresso diário ("3 de 5 doses concluídas") — elemento de gamificação, ver
  `styling.md`.
- Indicador de streak (dias consecutivos de adesão).
- Visão semanal (seletor de dias, DOM–SEX) acima da lista do dia.
- Lista de doses do dia com estado visual: concluída (check), próxima (destaque + botão
  "Confirmar"), futura (ícone de relógio, sem ação ainda disponível).
- Alerta de estoque baixo inline (ex: "Lisinopril — 4 dias restantes") com ação direta
  ("Atualizar medicação") e opção de dispensar ("Ignorar lembrete") — sem bloquear a tela.
- Atalho para "Gerenciar Estoques".
- Mini-gráfico de adesão semanal (barras) + texto de resumo ("100% de adesão mantida").
- Botão flutuante (+) fixo para cadastro rápido.
- Navegação inferior fixa: Home / Calendário / Remédios / Ajustes.

**Nota de implementação**: este é o padrão de referência para "card de destaque" (próxima
dose) reutilizável em outras telas que precisem de hierarquia visual forte.

### 2. Entrada de cadastro — ✅ Definida (duas variações no protótipo, unificar em uma)
O protótipo trouxe duas versões de tela de entrada: uma perguntando "Cadastrar Medicação vs
Cadastrar Compromisso" (`ponto_de_entrada_simplificado`), outra perguntando "Scanear código vs
Cadastro manual" (`ponto_de_entrada_medicamentos`, "Etapa 1 de 3"). São dois pontos de decisão
em sequência, não concorrentes:
1. Botão (+) da Home abre: **"O que deseja cadastrar?"** → Medicação | Compromisso.
2. Se escolher Medicação → **"Como deseja cadastrar?"** → Escanear código de barras | Manual.

Confirmar essa ordem antes de implementar navegação — hoje são duas telas soltas no protótipo.

### 3. Escanear código de barras — ✅ Definida
- Câmera com moldura de foco central, instrução "Aproxime o código de barras (padrão EAN)".
- Campo de entrada manual do código como alternativa (acessibilidade — nem todo idoso vai
  conseguir escanear de primeira, ou a câmera pode falhar).
- Ao capturar/digitar o EAN: buscar no dataset local da CMED (ver `cmed-data.md`) e
  pré-preencher o formulário manual (tela 4) com o que for encontrado.

### 4. Cadastro manual de medicamento — ✅ Definida (escopo ampliado em 2026-08-20)

Tem que cobrir **qualquer apresentação**, não só comprimido. A tensão do bloco é ser completo
sem ficar difícil.

**Uma tela, dois estados** (decisão de 2026-08-21, substitui as duas etapas de 20/08). Etapas e
acordeões foram descartados pelo mesmo motivo: obrigam a pessoa a operar a interface antes de
responder o que ela veio responder. Mas despejar tudo de uma vez polui. Então:

1. **Só o essencial na tela.** Nome, como toma, dose, frequência, duração. Mais nada existe.
2. Quando o essencial fica completo, **todo o resto aparece de uma vez**, anunciado por "Seu
   medicamento já pode ser cadastrado!" seguido do que o opcional serve pra fazer (estoque,
   receita à mão, lembrete). Uma transição só, previsível — seções nascendo a cada tecla fariam
   a tela pular debaixo do dedo, virando acordeão disfarçado.

O botão de salvar é **rodapé fixo**, nasce desabilitado dizendo o que falta e acende no mesmo
instante da revelação. É ele que comunica "daqui pra baixo é opcional".

**O essencial**:
1. **Nome*** — onde o autocomplete da CMED (B1) vai plugar.
2. **Como você toma*** — a forma farmacêutica, com rótulo humano.
3. **Quanto por vez*** — nas formas ambíguas a unidade vem **antes** da quantidade; nas demais
   ela já está dentro da pergunta ("quantos comprimidos de cada vez").
4. **Qual a frequência*** — todo dia / dias da semana / a cada X dias / só quando precisar.
5. **Por quanto tempo** — uso contínuo ou com prazo; no prazo, número + dias/semanas/meses, e a
   data final é derivada. Em "só quando precisar", "uso contínuo" vira "sempre disponível".

**O opcional**: estoque (com alerta e onde guardo), receita (foto ou PDF, com validade e aviso de
vencimento), alerta, foto da caixa e informações adicionais (como tomar, princípio ativo,
observação geral).

**Quatro frequências, e nenhuma responde à mesma pergunta que outra.** "A cada X horas" existiu e
foi removida em 21/08: era a única que misturava os dois eixos — *em quais dias* e *em que
horários* —, e como todo intervalo oferecido dividia o dia por igual (4, 6, 8, 12, 24), produzia
exatamente o mesmo agendamento que "todo dia" com os horários equivalentes. Dois caminhos para o
mesmo destino é dúvida na hora de escolher, e nada além disso.

"A cada X dias" é um mecanismo só (`cycle`: a cada N dias, tomando nos M primeiros) para três
coisas que as pessoas dizem de jeitos diferentes: cartela 28/21, dia sim dia não 2/1 e injeção
"de 30 em 30 dias" 30/1. Por isso não existe uma frequência "mensal" separada. Ele é ancorado na
**data do primeiro dia do ciclo atual**, e não no dia do cadastro: quem cadastra no quinto dia da
cartela receberia a pausa cinco dias atrasada, em silêncio. O preço assumido é que o ciclo
escorrega no calendário (a cada 30 dias desde 25/01 cai em 24/02).

**A dose pode variar por horário.** `ScheduledDose { at, amount }`, com `amount: null` querendo
dizer "a dose da prescrição". É o que permite insulina 10 UI de manhã e 8 à noite num cadastro
só, em vez de dois medicamentos iguais que quebrariam o estoque. A regra é override: horário com
número próprio manda, em branco herda — e a tela **diz isso**, senão dois números apareceriam se
contradizendo. O `DoseSchedule` grava a dose já resolvida, porque editar a posologia amanhã não
pode reescrever o que estava agendado ontem.

**Fração só onde ela existe.** `allowsFractionalDose` está na unidade, não no campo: meio
comprimido é rotina e o sulco está lá pra isso; ml, mg, g e UI são contínuos. Cápsula, gota,
adesivo, sachê, jato e aplicação só aceitam inteiro. As máscaras de `shared/number-input` filtram
na digitação, porque o teclado decimal do sistema é sugestão e não trava.

**A unidade é consequência, não pergunta.** Só três formas têm ambiguidade real e mostram
seletor: líquido (ml/mg), injeção (ml/UI/mg) e "outra" (livre). Nas demais a unidade é derivada
e exibida como selo apagado — quem marcou adesivo toma adesivo.

**Estoque conta na unidade da embalagem, não na da dose.** São eixos diferentes: a dose é o que
se toma (2 gotas), o estoque é o que se compra (um frasco de 20 ml). Gota se toma em gota e se
compra em ml, e é o ml que está impresso no frasco — contar na unidade errada quebra a única
conta que o estoque existe pra fazer, "quantos dias ainda dá".

**A frequência gera os horários.** Escolhida a frequência, pergunta-se quantas vezes por dia:
botões de 1× a 4× e, no fim da mesma fileira, um campo pro resto (até 12). São criados
exatamente esse número de horários, o que extingue por construção o erro de cadastrar "3 vezes ao
dia" e salvar com um horário só.

**Nada vem escolhido de fábrica.** Chegou a existir uma tabela de horários sugeridos; foi
removida, e a regra virou geral. Forma, dose, unidade (quando ambígua), frequência, vezes por
dia, ciclo, duração, modo de alerta e antecedência começam **todos vazios**.

O motivo: um seletor já marcado é indistinguível de uma resposta dada. A pessoa passa por ele sem
tocar e o cadastro sai com uma posologia que o app inventou — e erra em silêncio, que é pior do
que exigir a digitação. A única exceção é a unidade derivada da forma, porque ali não há chute:
quem marcou adesivo toma adesivo.

Efeito colateral bom: o essencial virou cascata. A dose só aparece depois da forma (sem ela não
dá pra saber se a pergunta é "quantos comprimidos" ou "quantos ml"), os horários só depois da
quantidade de doses, e o dia em que o ciclo começou só depois do tamanho do ciclo.

⚠️ Armadilha registrada: `[].every(...)` é `true`, então "nenhum horário escolhido" passaria por
"todos preenchidos". A validação testa `doseInputs.length > 0` explicitamente.

**Toda conta é feita sobre as doses geradas, nunca por divisão.** O tratamento é resumido em
doses e em quantidade consumida (`summarize-treatment`), e a duração do estoque vem de percorrer
as doses uma a uma (`estimate-stock-depletion`). Dividir quantidade por dose erraria nos dois
casos que o app suporta: dose que varia por horário e ciclo com dias de pausa. É isso que permite
avisar que "30 dias de antecedência" não cabe num estoque de quatro dias — sem bloquear, porque
comprar mais é o que resolve.

**Alertas** (o nome de tela; no domínio segue `reminderMode`): quatro modos em grade 2×2 com
ícone, cada um com uma linha de apoio. O texto enquadra a ferramenta como organização, não como
transferência de responsabilidade, e repete as palavras da seção 3 dos Termos de Uso — duas
versões da mesma promessa é como uma delas vira mentira. O aviso do aparelho é **condição, não
ressalva**: "com permissão, volume e o app fora da economia de bateria, os alertas chegam". O
acordeão "como funcionam" descreve o fluxo que o bloco C1 terá que entregar: o que o alerta
mostra, o que confirmar/adiar/ignorar faz com o status e com o estoque, e a soneca de 5 minutos
uma vez só.

**O que é longo de preencher e curto de rever mora em popup**: horários, estoque e lembrete. Na
tela fica só o resumo — fichinhas cinza com os horários, uma linha com a quantidade e o local do
estoque, o modo de lembrete escolhido. Além de encurtar a página, isso mata um efeito ruim: o
checkbox de estoque, ao ser marcado, fazia nascer quatro campos e empurrava a tela para baixo
debaixo do dedo de quem acabara de tocar nele.

**Anexos são uma seção só** — foto da caixa e receita juntas, com a validade aparecendo apenas
depois que há receita anexada.

**Campos que saíram do formulário** (2026-08-21):
- **Tarja** — quem cadastra à mão não sabe. Segue no domínio esperando a CMED (B1).
- **"Precisa de receita?"** — o ato de anexar a receita já responde. Um campo a menos, nenhuma
  informação perdida.
- **Princípio ativo** — desceu pro complemento; a pessoa comum não sabe, e o valor dele é
  comparar preço de genérico depois, não cadastrar agora.
- **Data de início** — inútil em uso contínuo. Continua no domínio (a geração de horários parte
  dela), gravada como hoje, e volta a ser editável quando "tratamentos" virar tela própria.

**Regras de exibição condicional** — ninguém deve preencher o que não se aplica ao seu caso;
campo fora de contexto gera dúvida, não completude:

| Situação | O que some |
|---|---|
| Essencial incompleto | todas as seções opcionais e o botão de salvar |
| Forma sem ambiguidade de unidade | o seletor de unidade (vira selo) |
| Frequência "só quando precisar" | seção de lembrete e os campos de horário |
| Frequência ≠ "dias da semana" | seleção de dias |
| "Uso contínuo" | duração em dias |
| "Não controlo estoque" | quantidade, alerta e onde guardo |
| Alerta de estoque desmarcado | antecedência do aviso |
| Receita não anexada | validade da receita |

**Formas farmacêuticas cobertas**: comprimido/cápsula, líquido, gota, injeção, pomada/creme,
sublingual, inalador, adesivo, sachê/pó, outro. A forma escolhida define as unidades de dose
oferecidas (`comprimido`, `ml`, `mg`, `g`, `gota`, `UI`, `aplicação`, `jato`, `adesivo`,
`sachê`) — filtrar não é inferir valor clínico, é evitar combinação sem sentido como "3 jatos de
pomada".

**Lembrete mora num popup próprio** (`ConfiguracaoDeLembrete`). É a única decisão do cadastro que
depende de permissão do sistema e muda o comportamento do aparelho fora do app — merece espaço
pra explicar alarme × notificação antes de escolher, em vez de três palavras num select.

**Gap resolvido em 2026-08-20**: local de guarda e anexo de receita entram nesta tela, e não numa
"v2" nem no C3. O paciente já está descrevendo o medicamento aqui; separar em outro bloco
significaria ele cadastrar duas vezes a mesma coisa. O que fica no C3 é a receita como
**compromisso** (validade, renovação, lembrete), não como anexo do remédio.

---

## Telas ainda em aberto (não desenhadas / não decididas)

Estas foram identificadas como necessárias pelo domínio (`SKILL.md` principal) mas não têm
protótipo visual ainda. Ao desenhá-las, seguir a base "Clinical Precision" + gamificação leve
de `styling.md`, e o padrão de card de destaque da Home quando fizer sentido.

- ~~**Onboarding / Consentimento LGPD**~~ — ✅ Implementada em 2026-08-13
  (`OnboardingConsentScreen`, entre Login e a ficha de saúde). Propósito do app, práticas de
  dado resumidas, Termos de Uso + Política de Privacidade completos (expansíveis,
  `legal-content.ts`), dois checkboxes obrigatórios (leitura dos termos + autorização de
  tratamento de dado sensível conforme art. 11 LGPD). Prova de consentimento persistida em
  `consent_records` (migration 006), versionada via `CURRENT_TERMS_VERSION` — se o texto legal
  mudar, bump na versão força reconsentimento. **Pendência não bloqueante**: `legal-content.ts`
  tem um `[PREENCHER]` na seção 7 (identificação do responsável pelo tratamento) — preencher
  antes de qualquer uso além de demonstração acadêmica, e idealmente validar o texto com
  orientador/banca antes da defesa.
- **Confirmação de dose (tela do alarme)**: o Plano Mestre descreve o fluxo (`Tratar na Hora` /
  `Adiar 5 min` / `Cancelar`), com uma segunda etapa de confirmação real ("Você tomou
  efetivamente?"). Não há tela desenhada — só o botão "Confirmar" já aparece embutido na Home.
  Definir se a confirmação acontece inline na Home (como já está) ou abre uma tela/modal
  dedicada quando vem de uma notificação push com o app fechado.
- **Estoque (tela dedicada)**: a Home já tem o atalho "Gerenciar Estoques", mas a tela em si
  não foi desenhada. Provavelmente uma lista de medicamentos com quantidade restante e
  previsão de esgotamento.
- **Agenda / Compromissos clínicos**: consultas e renovação de receita (`appointments`). O
  ponto de entrada já prevê "Cadastrar um Compromisso", mas não há tela de listagem/calendário
  mensal desenhada ainda (era o "Portal Temporal" do Plano Mestre).
- **Histórico / Relatório de adesão**: a Home mostra um mini-gráfico semanal, mas uma tela
  completa de histórico (mensal, por medicamento) ainda não existe.
- **Configurações**: acessada pelo ícone de perfil na Home. Definir o que entra aqui (edição
  de conta, tema claro/escuro, exportar dados / exclusão de conta conforme LGPD).
- **Estados vazios e offline**: nenhuma tela do protótipo mostra o estado "sem medicamentos
  cadastrados ainda" nem um indicador visual de "dados não sincronizados" (o app é
  offline-first, mas a Home hoje não comunica esse estado ao usuário).

## Decisões fechadas (conferência de 2026-08-07)

1. **Estoque baixo**: controle total do usuário. Por medicamento, ele decide (a) se quer ser
   avisado, e (b) com quantos dias/quanto de antecedência. Não há cálculo silencioso —
   monitoramento crônico (recompra) e agudo (ex: antibiótico de curso curto) usam a mesma
   mecânica, o usuário só configura diferente.
2. **Alarme vs notificação**: modo é **por prescrição** (`Prescription.reminderMode`), não
   global — cada tratamento tem sua própria criticidade (insulina vs suplemento de rotina).
   Três opções: `alarm` | `notification` | `none`.
   - **Modo alarme**: toca "estilo despertador" até o paciente desligar. Ao desligar, pede
     confirmação (Tomei / Não tomei / Adiar 5 min). **Adiamento máximo: 1 vez** (toca no
     máximo duas vezes no total) — `DoseSchedule.snoozeCount` trava em `0 | 1`. Existe também
     "ignorar por agora", que registra `IntakeLog.status = "deferred"` (visto, mas resolvido
     depois — diferente de nunca ter visto) em vez de forçar uma resposta.
   - **Modo notificação simples**: notificação padrão, sem bloquear tela.
   - **Modo none**: sem lembrete algum — o paciente confirma manualmente quando quiser, pela
     Home ou pela tela de gerenciamento de dose.
   - Confirmar/pular decide baixa de estoque (ver item 6) e alimenta a gamificação.
   - Em qualquer modo, tocar na notificação/alarme abre uma **tela dedicada de gerenciamento
     de dose**: mostra a dose que disparou em destaque **+ outras doses pendentes/atrasadas do
     dia** abaixo (não é uma tela de foco único nem a Home).
   - ⚠️ **Ressalva técnica**: alarme full-screen que interrompe o SO como um despertador nativo
     provavelmente exige development build (EAS) em vez de Expo Go puro — `expo-notifications`
     managed não garante esse comportamento. Validar viabilidade antes de prometer na UI.
3. **Onboarding**: tutorial guiado (telas explicando as funcionalidades principais) seguido do
   consentimento LGPD.
4. **Login/backup**: opcional. Login via Google (Supabase Auth) habilita backup/recuperação em
   outro aparelho; usar sem login é permitido, mas sem sync remoto. Perfil local (ficha médica)
   funciona independente de login.
5. **Perfil / ficha médica** (nova seção, além do que já estava no domínio): foto, nome,
   sobrenome, tipo sanguíneo, alergias, campos de preenchimento livre — funciona como "fichinha
   médica auxiliar" que o paciente sempre tem à mão (ex: tipo sanguíneo que ele mesmo esquece).
   Precisa entrar no modelo de dados como entidade própria (`patient_profile` ou similar).
6. **Baixa de estoque ao confirmar dose**: só desconta quando o paciente confirma que tomou.
   Dose não confirmada não desconta, mas fica marcada com destaque visual de falha (ex: "X" no
   calendário/histórico) — tratamento crítico, falha de adesão precisa ter ênfase visual, não
   passar despercebida. O registro é sempre editável depois (o paciente pode ter tomado e
   esquecido de marcar) — toda edição retroativa deve re-sincronizar o estoque calculado.
   Considerar um popup/lembrete de "seu estoque físico está alinhado com o app?" como reforço
   periódico, não obrigatório a cada dose.
7. **Gamificação**: manter simples por ora — barra de progresso diário + streak, só na Home.
   Sem tela dedicada de conquistas/badges nesta fase.
8. **Agenda/Compromissos**: escopo amplo — consultas, exames e renovação de receita, todos como
   parte de "gerenciamento completo para mitigação de falhas ao tratamento". Inclui upload de
   foto da receita com data de validade e data de renovação, gerando lembrete próprio (mesmo
   mecanismo de alarme/notificação de dose, adaptado).
9. **Configurações**: perfil/ficha médica, tema e cores (acessibilidade — contraste, paleta
   mais leve conforme preferência do paciente), backup/conta (status de login, última sync,
   exportar/excluir dados LGPD), permissões do app (câmera, notificações) — um lugar central
   pra esse tipo de ajuste.
10. **Fotos/anexos** (receita, foto de perfil, embalagem): sempre salvas localmente primeiro
    (offline-first). Backup no Supabase Storage é opt-out por registro — se o paciente não
    quiser aquele anexo específico na nuvem, ele não sobe, sem afetar o resto do sync. Dado
    sensível, tratado com o mesmo rigor de LGPD do restante.
11.5. **Tratamento de exceções (conferência de 2026-08-07, parte 2)**:
   - **`reminderMode = "none"`**: sem push algum. Quando o horário previsto passa sem
     confirmação, a dose vira "atrasada" com destaque visual forte na Home/tela de dose —
     reforço passivo, nunca notificação ativa.
   - **Doses nunca resolvidas** (`deferred` indefinido, "none" ignorado, notificação simples
     ignorada): ficam pendentes para sempre, sem fechamento automático por tempo. Só o próprio
     paciente resolve manualmente — nenhuma lógica decide "skipped" por conta própria.
   - **Permissão de notificação**: verificada no momento em que o paciente ativa
     `reminderMode = alarm/notification` numa prescrição (previne na raiz). Se a permissão for
     revogada depois, o app precisa detectar isso e sinalizar de forma visível sempre que
     houver prescrição ativa que dependa dela (ex: aviso persistente na Home) — nunca falhar
     silenciosamente.
   - **Correção retroativa de `IntakeLog` x estoque**: toda correção gera um novo `IntakeLog`
     (nunca sobrescreve o antigo, via `correctsLogId`) e, se o novo status muda o consumo
     efetivo, um novo `InventoryAdjustment` com `reason: "intake_correction"` aplicando só a
     diferença (delta) — nunca recalculando o estoque do zero. Isso preserva auditoria
     completa e compõe corretamente com recontagens manuais/sync de outro dispositivo que
     tenham acontecido nesse meio tempo, porque cada ajuste é um evento independente somado ao
     total, não uma substituição de valor. Implementado em `use-cases/correct-intake.ts`.
   - **Camada de domínio fechada** para esta rodada: `ports/prescription-repository.ts`,
     `ports/dose-schedule-repository.ts` (com `findPendingForDay`, base da tela dedicada de
     dose) e `use-cases/snooze-dose-alarm.ts` (aplica o limite de 1 adiamento).
   - **Pendência técnica anotada, não domínio**: checagem/observação de permissão de
     notificação depende da API do Expo — vai precisar de um port tipo
     `NotificationPermissionGateway` quando `src/notifications/` for implementado, pra manter
     o domínio sem dependência direta do Expo.

12. **Agente/MCP Anvisa** (IA conversacional sobre medicamentos, ex: "existe paracetamol de
    1g?", preço médio de dipirona): ideia registrada para **Fase 2**, depois do core (cadastro,
    estoque, alarmes, sync, agenda) estar pronto. Sempre com disclaimer de que não substitui
    prescrição/orientação médica. Ver nota em `cmed-data.md`.
