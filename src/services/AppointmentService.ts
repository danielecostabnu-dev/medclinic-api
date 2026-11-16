import { AppError } from '../errors/AppError';
import { UserRole } from '../entities/User';
import { AppointmentStatus } from '../entities/Appointment';
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

  async findAll(
    filters: {
      doctorId?: number;
      patientId?: number;
      status?: string;
      from?: string;
      to?: string;
    },
    page: number,
    pageSize: number,
    user: { id: number; roles: UserRole[] },
  ) {
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > 100
    ) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'Paginação inválida.',
      );
    }

    if (
      (filters.doctorId !== undefined &&
        (!Number.isInteger(filters.doctorId) ||
          filters.doctorId <= 0)) ||
      (filters.patientId !== undefined &&
        (!Number.isInteger(filters.patientId) ||
          filters.patientId <= 0))
    ) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'Filtro de médico ou paciente inválido.',
      );
    }

    if (
      filters.status !== undefined &&
      !Object.values(AppointmentStatus).includes(
        filters.status as AppointmentStatus,
      )
    ) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'Status inválido.',
      );
    }

    const parseDate = (value?: string): number | undefined => {
      if (value === undefined) return undefined;

      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new AppError('DADOS_INVALIDOS', 'Data inválida.');
      }

      const timestamp = Date.parse(value + 'T00:00:00Z');

      if (
        !Number.isFinite(timestamp) ||
        new Date(timestamp).toISOString().slice(0, 10) !== value
      ) {
        throw new AppError('DADOS_INVALIDOS', 'Data inválida.');
      }

      return timestamp;
    };

    const from = parseDate(filters.from);
    const to = parseDate(filters.to);

    if (
      from !== undefined &&
      to !== undefined &&
      (from > to || (to - from) / 86400000 > 30)
    ) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'Período inválido ou superior a 31 dias.',
      );
    }

    const effectiveFilters = { ...filters };

    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isDoctor = user.roles.includes(UserRole.DOCTOR);

    if (isDoctor && !isAdmin) {
      const doctorId =
        await this.appointmentRepository.findDoctorIdByUserId(
          user.id,
        );

      if (doctorId === null) {
        return { data: [], total: 0, page, pageSize };
      }

      effectiveFilters.doctorId = doctorId;
    }

    const [appointments, total] =
      await this.appointmentRepository.findAll(
        effectiveFilters,
        page,
        pageSize,
      );

    return {
      data: appointments.map((appointment) => ({
        id: appointment.id,
        doctorId: appointment.doctor.id,
        patientId: appointment.patient.id,
        startsAt: appointment.startsAt.toISOString(),
        endsAt: appointment.endsAt.toISOString(),
        status: appointment.status,
      })),
      total,
      page,
      pageSize,
    };
  }

  async updateStatus(
    id: number,
    status: AppointmentStatus,
    user: { id: number; roles: UserRole[] },
  ) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'ID do agendamento inválido.',
      );
    }

    if (!Object.values(AppointmentStatus).includes(status)) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'Status informado é inválido.',
      );
    }

    const appointment =
      await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw new AppError(
        'RECURSO_NAO_ENCONTRADO',
        'Agendamento não encontrado.',
      );
    }

    const currentStatus = appointment.status;

    const allowedTransitions: Record<
      AppointmentStatus,
      AppointmentStatus[]
    > = {
      [AppointmentStatus.SCHEDULED]: [
        AppointmentStatus.IN_PROGRESS,
        AppointmentStatus.CANCELLED,
      ],
      [AppointmentStatus.IN_PROGRESS]: [
        AppointmentStatus.DONE,
        AppointmentStatus.CANCELLED,
      ],
      [AppointmentStatus.DONE]: [],
      [AppointmentStatus.CANCELLED]: [],
    };

    if (!allowedTransitions[currentStatus].includes(status)) {
      throw new AppError(
        'TRANSICAO_INVALIDA',
        'Transição de status não permitida.',
      );
    }

    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isSecretary = user.roles.includes(UserRole.SECRETARY);
    const isDoctor = user.roles.includes(UserRole.DOCTOR);

    let isOwnDoctor = false;

    if (isDoctor && !isAdmin) {
      const doctorId =
        await this.appointmentRepository.findDoctorIdByUserId(
          user.id,
        );

      isOwnDoctor = doctorId === appointment.doctor.id;
    }

    let authorized = isAdmin;

    if (!authorized) {
      if (
        currentStatus === AppointmentStatus.SCHEDULED &&
        status === AppointmentStatus.CANCELLED
      ) {
        authorized = isSecretary || isOwnDoctor;
      } else {
        authorized = isOwnDoctor;
      }
    }

    if (!authorized) {
      throw new AppError(
        'ACESSO_NEGADO',
        'Usuário sem permissão para alterar este agendamento.',
      );
    }

    
    const updated =
      await this.appointmentRepository.updateStatus(
        id,
        currentStatus,
        status,
      );

    if (!updated) {
      throw new AppError(
        'RECURSO_NAO_ENCONTRADO',
        'Agendamento não encontrado.',
      );
    }

    return {
      id: updated.id,
      doctorId: updated.doctor.id,
      patientId: updated.patient.id,
      startsAt: updated.startsAt.toISOString(),
      endsAt: updated.endsAt.toISOString(),
      status: updated.status,
    };
  }


}
