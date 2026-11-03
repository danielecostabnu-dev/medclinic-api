import { Patient } from '../entities/Patient';

export interface IPatientRepository {
  create(name: string, cpf: string): Promise<Patient>;

  findByCpf(cpf: string): Promise<Patient | null>;

  findById(id: number): Promise<Patient | null>;

  findAll(
    page: number,
    pageSize: number,
    name?: string,
  ): Promise<[Patient[], number]>;

  update(patient: Patient): Promise<Patient>;

  delete(id: number): Promise<void>;
}
