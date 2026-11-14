import { Doctor } from '../entities/Doctor';

export interface CreateDoctorData {
  name: string;
  email: string;
  passwordHash: string;
  crm: string;
}

export interface IDoctorRepository {
  findByCrm(crm: string): Promise<Doctor | null>;

  emailExists(email: string): Promise<boolean>;

  createAtomic(data: CreateDoctorData): Promise<Doctor>;

  findById(id: number): Promise<Doctor | null>;

  findAll(
    page: number,
    pageSize: number,
    name?: string,
  ): Promise<[Doctor[], number]>;
}
