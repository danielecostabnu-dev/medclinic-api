import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Patient } from '../entities/Patient';

export class PatientRepository {
  private readonly repository: Repository<Patient>;

  constructor() {
    this.repository = AppDataSource.getRepository(Patient);
  }

  async create(name: string, cpf: string): Promise<Patient> {
    const patient = this.repository.create({ name, cpf });
    return this.repository.save(patient);
  }

  async findByCpf(cpf: string): Promise<Patient | null> {
    return this.repository.findOneBy({ cpf });
  }

  async findById(id: number): Promise<Patient | null> {
    return this.repository.findOneBy({ id });
  }

  async findAll(
    page: number,
    pageSize: number,
    name?: string,
  ): Promise<[Patient[], number]> {
    const query = this.repository.createQueryBuilder('patient');

    if (name) {
      query.where('patient.name ILIKE :name', {
        name: `%${name}%`,
      });
    }

    return query
      .orderBy('patient.id', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
  }

  async update(patient: Patient): Promise<Patient> {
    return this.repository.save(patient);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
