import { AppDataSource } from '../config/database';
import {
  Appointment,
  AppointmentStatus,
} from '../entities/Appointment';
import { Doctor } from '../entities/Doctor';
import { Patient } from '../entities/Patient';
import { WorkSchedule } from '../entities/WorkSchedule';
import { AppError } from '../errors/AppError';
import { UserRole } from '../entities/User';
import {
  CreateAppointmentInput,
  IAppointmentRepository,
} from './IAppointmentRepository';

const CLINIC_TIME_ZONE = 'America/Sao_Paulo';

function getClinicTime(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CLINIC_TIME_ZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? '';

  const weekdays: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    weekDay: weekdays[value('weekday')],
    hour: Number(value('hour')),
    minute: Number(value('minute')),
    second: Number(value('second')),
  };
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export class AppointmentRepository
  implements IAppointmentRepository
{
  async create(input: CreateAppointmentInput): Promise<Appointment> {
    return AppDataSource.transaction(async (manager) => {
      // Bloqueia o médico até terminar o agendamento.
      const doctor = await manager
        .getRepository(Doctor)
        .createQueryBuilder('doctor')
        .setLock('pessimistic_write')
        .where('doctor.id = :id', { id: input.doctorId })
        .getOne();

      if (!doctor) {
        throw new AppError(
          'RECURSO_NAO_ENCONTRADO',
          'Médico não encontrado.',
        );
      }

      // Também bloqueia o paciente para evitar
      // reservas simultâneas com médicos diferentes.
      const patient = await manager
        .getRepository(Patient)
        .createQueryBuilder('patient')
        .setLock('pessimistic_write')
        .where('patient.id = :id', { id: input.patientId })
        .getOne();

      if (!patient) {
        throw new AppError(
          'RECURSO_NAO_ENCONTRADO',
          'Paciente não encontrado.',
        );
      }

      const clinicTime = getClinicTime(input.startsAt);

      const startMinutes =
        clinicTime.hour * 60 + clinicTime.minute;

      const shifts = await manager.getRepository(WorkSchedule).find({
        where: {
          doctor: { id: doctor.id },
          weekDay: clinicTime.weekDay,
        },
      });

      const shift = shifts.find((item) => {
        const start = timeToMinutes(item.startTime);
        const end = timeToMinutes(item.endTime);

        return (
          startMinutes >= start &&
          startMinutes < end &&
          clinicTime.second === 0 &&
          (startMinutes - start) % item.slotDurationMinutes === 0 &&
          startMinutes + item.slotDurationMinutes <= end
        );
      });

      if (!shift) {
        throw new AppError(
          'HORARIO_FORA_DA_ESCALA',
          'Horário fora da escala ou desalinhado com a grade.',
        );
      }

      const endsAt = new Date(
        input.startsAt.getTime() +
          shift.slotDurationMinutes * 60_000,
      );

      // Verifica sobreposição de consultas do médico.
      const doctorBusy = await manager
        .getRepository(Appointment)
        .createQueryBuilder('appointment')
        .where('appointment.doctor_id = :doctorId', {
          doctorId: doctor.id,
        })
        .andWhere('appointment.status != :cancelled', {
          cancelled: AppointmentStatus.CANCELLED,
        })
        .andWhere('appointment.startsAt < :endsAt', {
          endsAt,
        })
        .andWhere('appointment.endsAt > :startsAt', {
          startsAt: input.startsAt,
        })
        .getExists();

      if (doctorBusy) {
        throw new AppError(
          'HORARIO_INDISPONIVEL',
          'O médico já possui uma consulta nesse horário.',
        );
      }

      // Verifica sobreposição de consultas do paciente.
      const patientBusy = await manager
        .getRepository(Appointment)
        .createQueryBuilder('appointment')
        .where('appointment.patient_id = :patientId', {
          patientId: patient.id,
        })
        .andWhere('appointment.status != :cancelled', {
          cancelled: AppointmentStatus.CANCELLED,
        })
        .andWhere('appointment.startsAt < :endsAt', {
          endsAt,
        })
        .andWhere('appointment.endsAt > :startsAt', {
          startsAt: input.startsAt,
        })
        .getExists();

      if (patientBusy) {
        throw new AppError(
          'PACIENTE_INDISPONIVEL',
          'O paciente já possui uma consulta nesse horário.',
        );
      }

      const appointment = manager.create(Appointment, {
        doctor,
        patient,
        startsAt: input.startsAt,
        endsAt,
        status: AppointmentStatus.SCHEDULED,
      });

      return manager.save(Appointment, appointment);
    });
  }

  async findById(id: number): Promise<Appointment | null> {
    return AppDataSource.getRepository(Appointment).findOne({
      where: { id },
      relations: {
        doctor: true,
        patient: true,
      },
    });
  }


  async findDoctorIdByUserId(userId: number): Promise<number | null> {
    const doctor = await AppDataSource.getRepository(Doctor).findOne({
      where: {
        user: { id: userId },
      },
    });

    return doctor?.id ?? null;
  }

}
