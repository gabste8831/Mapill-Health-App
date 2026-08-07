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

## Perguntas em aberto para fechar antes de implementar

1. O limiar de "estoque baixo" (Home mostra "4 dias restantes") é calculado automaticamente
   a partir da posologia + quantidade, ou o usuário define manualmente um número de dias?
2. Confirmação de dose: sempre inline na Home, ou abre uma tela dedicada quando disparada por
   notificação com o app fechado?
3. Onboarding/LGPD: prioridade alta — sem essa tela, nenhum outro fluxo pode ser implementado
   de forma compatível com a skill.
