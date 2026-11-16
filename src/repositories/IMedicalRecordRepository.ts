
import { MedicalRecord } from '../entities/MedicalRecord';

export interface IMedicalRecordRepository {
  patientExists(patientId: number): Promise<boolean>;

  findDoctorIdByUserId(
    userId: number,
  ): Promise<number | null>;

  hasPatientLink(
    doctorId: number,
    patientId: number,
  ): Promise<boolean>;

  create(
    doctorId: number,
    patientId: number,
    text: string,
  ): Promise<MedicalRecord>;

  findByPatientId(
    patientId: number,
  ): Promise<MedicalRecord[]>;
}
