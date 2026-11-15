import { AppError } from '../errors/AppError';
import {
  CreateAppointmentInput,
  IAppointmentRepository,
} from '../repositories/IAppointmentRepository';

export class AppointmentService {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async create(input: CreateAppointmentInput) {
    if (
      !Number.isInteger(input.doctorId) ||
      input.doctorId <= 0 ||
      !Number.isInteger(input.patientId) ||
      input.patientId <= 0 ||
      !(input.startsAt instanceof Date) ||
      Number.isNaN(input.startsAt.getTime())
    ) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'Dados do agendamento inválidos.',
      );
    }

    const appointment = await this.appointmentRepository.create(input);

    return {
      id: appointment.id,
      doctorId: appointment.doctor.id,
      patientId: appointment.patient.id,
      startsAt: appointment.startsAt.toISOString(),
      endsAt: appointment.endsAt.toISOString(),
      status: appointment.status,
    };
  }
}

