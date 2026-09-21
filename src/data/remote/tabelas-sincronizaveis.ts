/**
 * As tabelas que sobem e descem, e a ordem em que isso acontece.
 *
 * A ordem segue as dependencias, e nao o alfabeto: enviar pai antes de filho e o que mantem as duas
 * pontas coerentes sem transacao distribuida. Fora de ordem, uma prescricao sem o medicamento dela
 * vira linha orfa.
 *
 * As tabelas da CMED ficam de fora de proposito: sao dado de referencia identico em todo aparelho,
 * e sincronizar replicaria 7 mil linhas por usuario, apagadas junto no "apagar meus dados".
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
 * Colunas que existem so no aparelho e nunca sao enviadas.
 *
 * `synced_at` responde "esta linha ja subiu deste aparelho?", pergunta local por definicao: mandada
 * ao servidor, o aparelho B receberia o carimbo do A e concluiria ter sincronizado o que nunca viu.
 */
export const COLUNAS_LOCAIS = ["synced_at"] as const;

/**
 * Colunas que sobraram no SQLite e nao existem no servidor.
 *
 * O SQLite nao remove coluna, e migration publicada nao se edita: uma coluna substituida fica la,
 * vazia, para sempre. O push mandava a linha inteira e o PostgREST recusa o lote todo, entao uma
 * coluna orfa bloqueava a sincronizacao inteira do usuario.
 *
 * Listar em vez de filtrar pelo schema remoto e deliberado: falha por coluna nova deve aparecer
 * como erro, e nao ser engolida. So entra o que ja foi substituido, com a migration anotada ao lado.
 */
export const COLUNAS_ORFAS: Partial<Record<TabelaSincronizavel, string[]>> = {
  // Substituídas pela lista `emergency_contacts` na migration 005.
  patient_profiles: [
    "emergency_contact_name",
    "emergency_contact_phone",
    "emergency_contact_relationship",
  ],
  /**
   * A receita nasceu como anexo do compromisso e mudou de dono: ela pertence a prescricao, onde o
   * paciente ja esta descrevendo o medicamento. As colunas viraram `attachment_*` em
   * `prescriptions`, e estas tres ficaram vazias no SQLite.
   */
  appointments: ["prescription_photo_uri", "prescription_valid_until", "photo_sync_opt_out"],
};

/**
 * Colunas cujo conteúdo é um caminho de arquivo **no aparelho** (`file:///data/user/0/…`).
 *
 * Sobem como estão, e é inútil do outro lado - um caminho do aparelho A não abre no aparelho B.
 * Ficam listadas aqui porque é o que o E9 vai precisar trocar por uma URL do Storage, e porque
 * quem lê o código precisa saber que esses campos não significam nada depois de restaurados.
 */
export const COLUNAS_DE_ARQUIVO_LOCAL: Partial<Record<TabelaSincronizavel, string[]>> = {
  patient_profiles: ["photo_uri"],
  medications: ["photo_uri"],
  prescriptions: ["attachment_uri"],
};
