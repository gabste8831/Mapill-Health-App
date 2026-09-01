/**
 * As tabelas que sobem e descem, e a ordem em que isso acontece.
 *
 * **A ordem importa e não é alfabética.** Ela segue as dependências: `prescriptions` aponta para
 * `medications`, `dose_schedules` para `prescriptions`, `intake_logs` para `dose_schedules`. Subir
 * uma prescrição antes do medicamento dela criaria uma linha órfã no servidor; descer na ordem
 * errada faria o mesmo localmente. Enviar pai antes de filho é o que mantém as duas pontas
 * coerentes sem precisar de transação distribuída.
 *
 * `cmed_entries` e `cmed_eans` **não estão aqui**, de propósito: o catálogo da Anvisa é dado de
 * referência embutido no app, idêntico em todo aparelho. Sincronizá-lo replicaria um dicionário de
 * 7 mil linhas por usuário e o apagaria junto no "apagar meus dados".
 */
export const TABELAS_SINCRONIZAVEIS = [
  // Independentes primeiro.
  "patient_profiles",
  "consent_records",
  "medications",
  "appointments",
  // Dependem de medications.
  "prescriptions",
  "inventory_items",
  // Dependem de prescriptions / inventory_items.
  "dose_schedules",
  "inventory_adjustments",
  // Depende de dose_schedules.
  "intake_logs",
] as const;

export type TabelaSincronizavel = (typeof TABELAS_SINCRONIZAVEIS)[number];

/**
 * Colunas que existem **só no aparelho** e nunca são enviadas.
 *
 * `synced_at` é o caso principal: ele responde "esta linha já subiu **deste** aparelho?", que é uma
 * pergunta local por definição. Mandá-lo ao servidor faria o aparelho B receber o carimbo do
 * aparelho A e concluir que já sincronizou algo que nunca viu.
 */
export const COLUNAS_LOCAIS = ["synced_at"] as const;

/**
 * Colunas que **sobraram no SQLite** e não existem no servidor.
 *
 * O SQLite não remove coluna, e a regra do projeto é que migration publicada não se edita — então
 * uma coluna substituída fica lá, vazia, para sempre. A 004 criou `emergency_contact_name/phone/
 * relationship` e a 005 as trocou por `emergency_contacts` (uma lista JSON); as três antigas
 * continuam na tabela local, e o schema do Supabase — escrito a partir do modelo **atual** — nunca
 * as teve.
 *
 * Foi o que quebrou a sincronização na validação de 01/09:
 * `Could not find the 'emergency_contact_name' column of 'patient_profiles' in the schema cache`.
 * O push mandava a linha inteira, incluindo o que morreu na 005, e o PostgREST recusa o lote todo —
 * uma coluna órfã bloqueava a sincronização inteira do usuário.
 *
 * Listar em vez de filtrar por schema remoto é deliberado: falha de sincronização por coluna nova
 * deve aparecer como erro, e não ser engolida em silêncio. O que entra aqui é só o que já foi
 * substituído por outra coluna, com a migration que fez a troca anotada ao lado.
 */
export const COLUNAS_ORFAS: Partial<Record<TabelaSincronizavel, string[]>> = {
  // Substituídas pela lista `emergency_contacts` na migration 005.
  patient_profiles: [
    "emergency_contact_name",
    "emergency_contact_phone",
    "emergency_contact_relationship",
  ],
  /**
   * A receita nasceu como anexo do **compromisso** (migration 002) e mudou de dono em 20/08: ela
   * pertence à prescrição, onde o paciente já está descrevendo o medicamento. As colunas viraram
   * `attachment_uri` / `attachment_valid_until` / `attachment_sync_opt_out` em `prescriptions`, e
   * estas três ficaram vazias no SQLite.
   *
   * Não deram erro na validação de 01/09 só porque `patient_profiles` sobe primeiro e o push parou
   * ali. Seriam a falha seguinte.
   */
  appointments: ["prescription_photo_uri", "prescription_valid_until", "photo_sync_opt_out"],
};

/**
 * Colunas cujo conteúdo é um caminho de arquivo **no aparelho** (`file:///data/user/0/…`).
 *
 * Sobem como estão, e é inútil do outro lado — um caminho do aparelho A não abre no aparelho B.
 * Ficam listadas aqui porque é o que o E9 vai precisar trocar por uma URL do Storage, e porque
 * quem lê o código precisa saber que esses campos não significam nada depois de restaurados.
 */
export const COLUNAS_DE_ARQUIVO_LOCAL: Partial<Record<TabelaSincronizavel, string[]>> = {
  patient_profiles: ["photo_uri"],
  medications: ["photo_uri"],
  prescriptions: ["attachment_uri"],
};
