
import bcrypt from 'bcrypt';
import { Doctor } from '../entities/Doctor';
import { AppError } from '../errors/AppError';
import { IDoctorRepository } from '../repositories/IDoctorRepository';

interface CreateDoctorInput {
  name: string;
  email: string;
  password: string;
  crm: string;
}

interface DatabaseError {
  code?: string;
  constraint?: string;
  driverError?: {
    code?: string;
    constraint?: string;
  };
}

export class DoctorService {
  constructor(
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async create(input: CreateDoctorInput): Promise<Doctor> {
    if (
      !input ||
      typeof input.name !== 'string' ||
      !input.name.trim() ||
      input.name.trim().length > 150 ||
      typeof input.email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()) ||
      input.email.trim().length > 255 ||
      typeof input.password !== 'string' ||
      !input.password.trim() ||
      typeof input.crm !== 'string' ||
      !input.crm.trim() ||
      input.crm.trim().length > 30
    ) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'Dados do médico inválidos.',
      );
    }

    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const crm = input.crm.trim();

    if (await this.doctorRepository.emailExists(email)) {
      throw new AppError(
        'EMAIL_JA_CADASTRADO',
        'E-mail já cadastrado.',
      );
    }

    if (await this.doctorRepository.findByCrm(crm)) {
      throw new AppError(
        'CRM_JA_CADASTRADO',
        'CRM já cadastrado.',
      );
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    try {
      return await this.doctorRepository.createAtomic({
        name,
        email,
        passwordHash,
        crm,
      });
    } catch (error: unknown) {
      const dbError = error as DatabaseError;

      const code = dbError.driverError?.code ?? dbError.code;
      const constraint =
        dbError.driverError?.constraint ??
        dbError.constraint ??
        '';

      if (code === '23505') {
        if (constraint === 'UQ_doctors_crm') {
          throw new AppError(
            'CRM_JA_CADASTRADO',
            'CRM já cadastrado.',
          );
        }

        if (constraint.toLowerCase().includes('email')) {
          throw new AppError(
            'EMAIL_JA_CADASTRADO',
            'E-mail já cadastrado.',
          );
        }
      }

      throw error;
    }
  }

  async findById(id: number): Promise<Doctor> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new AppError('DADOS_INVALIDOS', 'ID inválido.');
    }

    const doctor = await this.doctorRepository.findById(id);

    if (!doctor) {
      throw new AppError(
        'RECURSO_NAO_ENCONTRADO',
        'Médico não encontrado.',
      );
    }

    return doctor;
  }

  async findAll(
    page: number,
    pageSize: number,
    name?: string,
  ): Promise<{
    data: Doctor[];
    meta: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }> {
    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isSafeInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > 100 ||
      (name !== undefined && typeof name !== 'string')
    ) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'Filtros inválidos.',
      );
    }

    const [data, total] = await this.doctorRepository.findAll(
      page,
      pageSize,
      name,
    );

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
