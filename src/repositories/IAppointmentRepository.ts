
import { Appointment } from '../entities/Appointment';

export interface CreateAppointmentInput {
  doctorId: number;
  patientId: number;
  startsAt: Date;
}

export interface IAppointmentRepository {
  create(input: CreateAppointmentInput): Promise<Appointment>;
}
