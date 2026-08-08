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

### 4. Cadastro manual de medicamento — ✅ Definida
- Foto da embalagem (câmera ou galeria) — reconhecimento visual futuro (Nielsen).
- Nome do medicamento, princípio ativo, dosagem, tipo (seletor: pílula, líquido, injetável etc.
  — afeta quais campos aparecem depois, ex: "Volume" em vez de "Comprimidos").
- Posologia: frequência (Diário / Intervalo / Semanal / SOS) + horários (lista editável de
  horários, "+ Adicionar").
- Estoque: quantidade em mãos com estepper (+/-), sem passo de "definir alerta" separado —
  o alerta é derivado automaticamente (ver seção "Em aberto" abaixo sobre o limiar).
- Botão único de salvar ("Salvar Medicamento").

**Gap identificado no protótipo**: não há campo pra local de guarda em casa, nem para anexar
receita/PDF — ambos estavam no Plano Mestre (zip) mas não apareceram no formulário desenhado.
Confirmar se entram nesta tela ou ficam pra uma "v2" do cadastro.

---

## Telas ainda em aberto (não desenhadas / não decididas)

Estas foram identificadas como necessárias pelo domínio (`SKILL.md` principal) mas não têm
protótipo visual ainda. Ao desenhá-las, seguir a base "Clinical Precision" + gamificação leve
de `styling.md`, e o padrão de card de destaque da Home quando fizer sentido.

- **Onboarding / Consentimento LGPD**: obrigatória antes do primeiro registro clínico (ver
  `SKILL.md` — seção LGPD). Ainda não tem tela nenhuma no protótipo — é bloqueante para
  qualquer implementação de cadastro, então vale priorizar o desenho dela cedo.
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

12. **Agente/MCP Anvisa** (IA conversacional sobre medicamentos, ex: "existe paracetamol de
    1g?", preço médio de dipirona): ideia registrada para **Fase 2**, depois do core (cadastro,
    estoque, alarmes, sync, agenda) estar pronto. Sempre com disclaimer de que não substitui
    prescrição/orientação médica. Ver nota em `cmed-data.md`.
