import {
  Appointment,
  AppointmentStatus,
} from '../entities/Appointment';

export interface CreateAppointmentInput {
  doctorId: number;
  patientId: number;
  startsAt: Date;
}

export interface IAppointmentRepository {
  create(input: CreateAppointmentInput): Promise<Appointment>;

  findById(id: number): Promise<Appointment | null>;

  findDoctorIdByUserId(userId: number): Promise<number | null>;

  findAll(
    filters: {
      doctorId?: number;
      patientId?: number;
      status?: string;
      from?: string;
      to?: string;
    },
    page: number,
    pageSize: number,
  ): Promise<[Appointment[], number]>;


  
  updateStatus(
    id: number,
    expectedStatus: AppointmentStatus,
    newStatus: AppointmentStatus,
  ): Promise<Appointment | null>;

}