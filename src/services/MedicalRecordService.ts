
import { UserRole } from '../entities/User';
import { AppError } from '../errors/AppError';
import { IMedicalRecordRepository } from '../repositories/IMedicalRecordRepository';

interface AuthenticatedUser {
  id: number;
  roles: UserRole[];
}

export class MedicalRecordService {
  constructor(
    private readonly repository: IMedicalRecordRepository,
  ) {}

  async create(
    patientId: number,
    text: string,
    user: AuthenticatedUser,
  ) {
    if (!Number.isSafeInteger(patientId) || patientId <= 0) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'ID do paciente inválido.',
      );
    }

    if (typeof text !== 'string' || text.trim().length === 0) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'O texto do prontuário é obrigatório.',
      );
    }

    if (
      !user.roles.includes(UserRole.DOCTOR) ||
      user.roles.includes(UserRole.ADMIN) ||
      user.roles.includes(UserRole.SECRETARY)
    ) {
      throw new AppError(
        'ACESSO_NEGADO',
        'Somente médicos podem registrar prontuários.',
      );
    }

    if (!(await this.repository.patientExists(patientId))) {
      throw new AppError(
        'RECURSO_NAO_ENCONTRADO',
        'Paciente não encontrado.',
      );
    }

    const doctorId = await this.repository.findDoctorIdByUserId(
      user.id,
    );

    if (
      doctorId === null ||
      !(await this.repository.hasPatientLink(doctorId, patientId))
    ) {
      throw new AppError(
        'ACESSO_NEGADO',
        'O médico não possui vínculo de atendimento com este paciente.',
      );
    }

    const record = await this.repository.create(
      doctorId,
      patientId,
      text.trim(),
    );

    return {
      id: record.id,
      patientId,
      doctorId,
      text: record.text,
      createdAt: record.createdAt.toISOString(),
    };
  }

  async findByPatientId(
    patientId: number,
    user: AuthenticatedUser,
  ) {
    if (!Number.isSafeInteger(patientId) || patientId <= 0) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'ID do paciente inválido.',
      );
    }

    if (
      user.roles.includes(UserRole.SECRETARY) ||
      (!user.roles.includes(UserRole.ADMIN) &&
        !user.roles.includes(UserRole.DOCTOR))
    ) {
      throw new AppError(
        'ACESSO_NEGADO',
        'Usuário sem permissão para consultar prontuários.',
      );
    }

    if (!(await this.repository.patientExists(patientId))) {
      throw new AppError(
        'RECURSO_NAO_ENCONTRADO',
        'Paciente não encontrado.',
      );
    }

    if (!user.roles.includes(UserRole.ADMIN)) {
      const doctorId = await this.repository.findDoctorIdByUserId(
        user.id,
      );

      if (
        doctorId === null ||
        !(await this.repository.hasPatientLink(doctorId, patientId))
      ) {
        throw new AppError(
          'ACESSO_NEGADO',
          'O médico não possui vínculo de atendimento com este paciente.',
        );
      }
    }

    const records = await this.repository.findByPatientId(patientId);

    return {
      data: records.map((record) => ({
        id: record.id,
        patientId: record.patient.id,
        doctorId: record.doctor.id,
        text: record.text,
        createdAt: record.createdAt.toISOString(),
      })),
      total: records.length,
    };
  }
}
