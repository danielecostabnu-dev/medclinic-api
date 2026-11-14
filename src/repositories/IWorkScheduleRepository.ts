import { WorkSchedule } from '../entities/WorkSchedule';

export interface WorkShiftInput {
  weekDay: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface IWorkScheduleRepository {
  doctorExists(doctorId: number): Promise<boolean>;

  findByDoctorId(doctorId: number): Promise<WorkSchedule[]>;

  replaceAll(
    doctorId: number,
    shifts: WorkShiftInput[],
  ): Promise<void>;
}
