import type { SyncableEntity } from "./syncable";

/**
 * Prova de consentimento explícito à LGPD (art. 7º, I e art. 11, I — base legal específica e
 * reforçada para dado sensível de saúde). Condição obrigatória antes de qualquer tela que
 * colete dado clínico (ficha de saúde, medicamentos, doses, compromissos).
 *
 * Se o texto de Termos/Política mudar, `termsVersion` muda junto — um registro de versão
 * antiga não conta como consentimento válido para a versão vigente, e o paciente precisa
 * consentir de novo (ver CURRENT_TERMS_VERSION em texto-legal.ts).
 */
export type ConsentRecord = SyncableEntity & {
  termsVersion: string;
  /** ISO 8601 — timestamp exato do aceite, guardado como prova. */
  acceptedAt: string;
};
