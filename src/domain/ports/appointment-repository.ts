import type { Appointment } from "../entities/appointment";
import type { Repository } from "./repository";

export interface AppointmentRepository extends Repository<Appointment> {
  /** Compromissos futuros a partir de `referenceDate`, para a tela de Agenda. */
  findUpcoming(referenceDate: string): Promise<Appointment[]>;
  /**
   * Todos os não excluídos, do mais próximo ao mais distante. A ordenação sai daqui e não da
   * tela: é o banco que tem o índice, e ordenar em memória custaria mais a cada compromisso novo.
   */
  findAllOrderedByDate(): Promise<Appointment[]>;
}
