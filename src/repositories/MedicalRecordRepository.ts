
import { AppDataSource } from '../config/database';
import { Appointment, AppointmentStatus } from '../entities/Appointment';
import { Doctor } from '../entities/Doctor';
import { MedicalRecord } from '../entities/MedicalRecord';
import { Patient } from '../entities/Patient';
import { IMedicalRecordRepository } from './IMedicalRecordRepository';

export class MedicalRecordRepository
  implements IMedicalRecordRepository
{
  async patientExists(patientId: number): Promise<boolean> {
    return AppDataSource.getRepository(Patient).exists({
      where: { id: patientId },
    });
  }

  async findDoctorIdByUserId(
    userId: number,
  ): Promise<number | null> {
    const doctor = await AppDataSource.getRepository(Doctor).findOne({
      where: {
        user: { id: userId },
      },
    });

    return doctor?.id ?? null;
  }

  async hasPatientLink(
    doctorId: number,
    patientId: number,
  ): Promise<boolean> {
    return AppDataSource.getRepository(Appointment).exists({
      where: [
        {
          doctor: { id: doctorId },
          patient: { id: patientId },
          status: AppointmentStatus.IN_PROGRESS,
        },
        {
          doctor: { id: doctorId },
          patient: { id: patientId },
          status: AppointmentStatus.DONE,
        },
      ],
    });
  }

  async create(
    doctorId: number,
    patientId: number,
    text: string,
  ): Promise<MedicalRecord> {
    const repository = AppDataSource.getRepository(MedicalRecord);

    const record = repository.create({
      doctor: { id: doctorId },
      patient: { id: patientId },
      text,
    });

    return repository.save(record);
  }

  async findByPatientId(
    patientId: number,
  ): Promise<MedicalRecord[]> {
    return AppDataSource.getRepository(MedicalRecord).find({
      where: {
        patient: { id: patientId },
      },
      relations: {
        doctor: true,
        patient: true,
      },
      order: {
        createdAt: 'DESC',
        id: 'DESC',
      },
    });
  }
}
