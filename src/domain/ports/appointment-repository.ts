import type { Appointment } from "../entities/appointment";
import type { Repository } from "./repository";

export interface AppointmentRepository extends Repository<Appointment> {
  /** Compromissos futuros a partir de `referenceDate`, para a tela de Agenda. */
  findUpcoming(referenceDate: string): Promise<Appointment[]>;
}
