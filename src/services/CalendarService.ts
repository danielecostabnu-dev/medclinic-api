
import { AppDataSource } from '../config/database';
import { Doctor } from '../entities/Doctor';
import { WorkSchedule } from '../entities/WorkSchedule';
import {
  Appointment,
  AppointmentStatus,
} from '../entities/Appointment';
import { AppError } from '../errors/AppError';

export class CalendarService {
  async findByDoctorId(
    doctorId: number,
    from: string,
    to: string,
  ) {
    if (!Number.isSafeInteger(doctorId) || doctorId <= 0) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'ID do médico inválido.',
      );
    }

    const parseDate = (value: string): number => {
      if (
        typeof value !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
      ) {
        throw new AppError('DADOS_INVALIDOS', 'Data inválida.');
      }

      const timestamp = Date.parse(`${value}T00:00:00Z`);

      if (
        !Number.isFinite(timestamp) ||
        new Date(timestamp).toISOString().slice(0, 10) !== value
      ) {
        throw new AppError('DADOS_INVALIDOS', 'Data inválida.');
      }

      return timestamp;
    };

    const fromDate = parseDate(from);
    const toDate = parseDate(to);

    if (
      fromDate > toDate ||
      (toDate - fromDate) / 86400000 > 30
    ) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'Período inválido ou superior a 31 dias.',
      );
    }

    const doctor = await AppDataSource
      .getRepository(Doctor)
      .findOneBy({ id: doctorId });

    if (!doctor) {
      throw new AppError(
        'RECURSO_NAO_ENCONTRADO',
        'Médico não encontrado.',
      );
    }

    const shifts = await AppDataSource
      .getRepository(WorkSchedule)
      .find({
        where: { doctor: { id: doctorId } },
        order: {
          weekDay: 'ASC',
          startTime: 'ASC',
        },
      });

    const appointments = await AppDataSource
      .getRepository(Appointment)
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .where('appointment.doctor_id = :doctorId', { doctorId })
      .andWhere('appointment.status != :cancelled', {
        cancelled: AppointmentStatus.CANCELLED,
      })
      .andWhere(
        "(appointment.\"startsAt\" AT TIME ZONE 'America/Sao_Paulo')::date BETWEEN CAST(:from AS date) AND CAST(:to AS date)",
        { from, to },
      )
      .orderBy('appointment.startsAt', 'ASC')
      .getMany();

    return {
      workSchedule: {
        shifts: shifts.map((shift) => ({
          weekDay: shift.weekDay,
          startTime: shift.startTime.slice(0, 5),
          endTime: shift.endTime.slice(0, 5),
          slotDurationMinutes: shift.slotDurationMinutes,
        })),
      },
      appointments: appointments.map((appointment) => ({
        id: appointment.id,
        patientId: appointment.patient?.id,
        startsAt: appointment.startsAt.toISOString(),
        endsAt: appointment.endsAt.toISOString(),
        status: appointment.status,
      })),
    };
  }
}
