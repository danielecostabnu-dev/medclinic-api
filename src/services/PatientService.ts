import { Patient } from '../entities/Patient';
import { IPatientRepository } from '../repositories/IPatientRepository';
import { AppError } from '../errors/AppError';

export class PatientService {
  constructor(
    private readonly patientRepository: IPatientRepository,
  ) {}

  async create(name: string, cpf: string): Promise<Patient> {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new AppError('DADOS_INVALIDOS', 'Nome obrigatório.');
    }

    if (typeof cpf !== 'string' || !/^\d{11}$/.test(cpf)) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'O CPF deve conter 11 dígitos numéricos.',
      );
    }

    const existingPatient = await this.patientRepository.findByCpf(cpf);

    if (existingPatient) {
      throw new AppError('CPF_JA_CADASTRADO', 'CPF já cadastrado.');
    }

    return this.patientRepository.create(name.trim(), cpf);
  }

  async findById(id: number): Promise<Patient> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new AppError('DADOS_INVALIDOS', 'ID inválido.');
    }

    const patient = await this.patientRepository.findById(id);

    if (!patient) {
      throw new AppError(
        'RECURSO_NAO_ENCONTRADO',
        'Paciente não encontrado.',
      );
    }

    return patient;
  }

  async findAll(
    page: number,
    pageSize: number,
    name?: string,
  ): Promise<{
    data: Patient[];
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
      throw new AppError('DADOS_INVALIDOS', 'Filtros inválidos.');
    }

    const [data, total] = await this.patientRepository.findAll(
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

  async update(id: number, name: string): Promise<Patient> {
    const patient = await this.findById(id);

    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new AppError('DADOS_INVALIDOS', 'Nome inválido.');
    }

    patient.name = name.trim();
    return this.patientRepository.update(patient);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.patientRepository.delete(id);
  }
}
