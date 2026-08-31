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
