import { AppError } from '../errors/AppError';
import {
  IWorkScheduleRepository,
  WorkShiftInput,
} from '../repositories/IWorkScheduleRepository';

interface WorkScheduleResponse {
  shifts: WorkShiftInput[];
}

export class WorkScheduleService {
  constructor(
    private readonly repository: IWorkScheduleRepository,
  ) {}

  async findByDoctorId(
    doctorId: number,
  ): Promise<WorkScheduleResponse> {
    await this.validateDoctor(doctorId);

    const schedules = await this.repository.findByDoctorId(doctorId);

    return {
      shifts: schedules.map((schedule) => ({
        weekDay: schedule.weekDay,
        startTime: schedule.startTime.slice(0, 5),
        endTime: schedule.endTime.slice(0, 5),
        slotDurationMinutes: schedule.slotDurationMinutes,
      })),
    };
  }

  async replaceAll(
    doctorId: number,
    shifts: WorkShiftInput[],
  ): Promise<WorkScheduleResponse> {
    await this.validateDoctor(doctorId);

    if (!Array.isArray(shifts)) {
      throw new AppError('DADOS_INVALIDOS', 'Lista de turnos inválida.');
    }

    for (const shift of shifts) {
      this.validateShift(shift);
    }

    for (let i = 0; i < shifts.length; i++) {
      for (let j = i + 1; j < shifts.length; j++) {
        const first = shifts[i];
        const second = shifts[j];

        if (
          first.weekDay === second.weekDay &&
          first.startTime < second.endTime &&
          second.startTime < first.endTime
        ) {
          throw new AppError(
            'DADOS_INVALIDOS',
            'Turnos do mesmo dia não podem se sobrepor.',
          );
        }
      }
    }

    await this.repository.replaceAll(doctorId, shifts);

    return { shifts };
  }

  private async validateDoctor(doctorId: number): Promise<void> {
    if (!Number.isSafeInteger(doctorId) || doctorId <= 0) {
      throw new AppError('DADOS_INVALIDOS', 'ID do médico inválido.');
    }

    if (!(await this.repository.doctorExists(doctorId))) {
      throw new AppError(
        'RECURSO_NAO_ENCONTRADO',
        'Médico não encontrado.',
      );
    }
  }

  private validateShift(shift: WorkShiftInput): void {
    if (
      !shift ||
      !Number.isInteger(shift.weekDay) ||
      shift.weekDay < 0 ||
      shift.weekDay > 6 ||
      typeof shift.startTime !== 'string' ||
      !this.isValidTime(shift.startTime) ||
      typeof shift.endTime !== 'string' ||
      !this.isValidTime(shift.endTime) ||
      shift.startTime >= shift.endTime ||
      !Number.isInteger(shift.slotDurationMinutes) ||
      shift.slotDurationMinutes <= 0
    ) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'Turno inválido.',
      );
    }
  }

  private isValidTime(value: string): boolean {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
      return false;
    }

    return true;
  }
}
