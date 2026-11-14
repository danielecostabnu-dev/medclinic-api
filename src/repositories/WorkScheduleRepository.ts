import { AppDataSource } from '../config/database';
import { Doctor } from '../entities/Doctor';
import { WorkSchedule } from '../entities/WorkSchedule';
import {
  IWorkScheduleRepository,
  WorkShiftInput,
} from './IWorkScheduleRepository';

export class WorkScheduleRepository
  implements IWorkScheduleRepository
{
  async doctorExists(doctorId: number): Promise<boolean> {
    return AppDataSource.getRepository(Doctor).exists({
      where: { id: doctorId },
    });
  }

  async findByDoctorId(
    doctorId: number,
  ): Promise<WorkSchedule[]> {
    return AppDataSource.getRepository(WorkSchedule).find({
      where: { doctor: { id: doctorId } },
      order: {
        weekDay: 'ASC',
        startTime: 'ASC',
      },
    });
  }

  async replaceAll(
    doctorId: number,
    shifts: WorkShiftInput[],
  ): Promise<void> {
    await AppDataSource.transaction(async (manager) => {
      // Remove a escala anterior dentro da transação.
      await manager.delete(WorkSchedule, {
        doctor: { id: doctorId },
      });

      // Uma lista vazia remove toda a escala.
      if (shifts.length === 0) {
        return;
      }

      const doctor = await manager.findOneByOrFail(Doctor, {
        id: doctorId,
      });

      const schedules = shifts.map((shift) =>
        manager.create(WorkSchedule, {
          doctor,
          weekDay: shift.weekDay,
          startTime: shift.startTime,
          endTime: shift.endTime,
          slotDurationMinutes: shift.slotDurationMinutes,
        }),
      );

      await manager.save(WorkSchedule, schedules);
    });
  }
}
