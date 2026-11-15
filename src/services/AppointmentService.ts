
import { AppError } from '../errors/AppError';
import { UserRole } from '../entities/User';
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

  async findById(
    id: number,
    user: { id: number; roles: UserRole[] },
  ) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'ID do agendamento inválido.',
      );
    }

    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw new AppError(
        'RECURSO_NAO_ENCONTRADO',
        'Agendamento não encontrado.',
      );
    }

    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isDoctor = user.roles.includes(UserRole.DOCTOR);

    if (isDoctor && !isAdmin) {
      const doctorId =
        await this.appointmentRepository.findDoctorIdByUserId(
          user.id,
        );

      if (doctorId !== appointment.doctor.id) {
        throw new AppError(
          'ACESSO_NEGADO',
          'Você não tem permissão para consultar este agendamento.',
        );
      }
    }

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
