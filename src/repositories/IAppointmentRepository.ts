
import { Appointment } from '../entities/Appointment';

export interface CreateAppointmentInput {
  doctorId: number;
  patientId: number;
  startsAt: Date;
}

export interface IAppointmentRepository {
  create(input: CreateAppointmentInput): Promise<Appointment>;

  findById(id: number): Promise<Appointment | null>;

  findDoctorIdByUserId(userId: number): Promise<number | null>;
}
