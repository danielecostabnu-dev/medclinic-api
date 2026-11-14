import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Doctor } from './Doctor';

@Entity('work_schedules')
export class WorkSchedule {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Doctor, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctor_id' })
  doctor!: Doctor;

  @Column({ type: 'integer' })
  weekDay!: number;

  @Column({ type: 'time' })
  startTime!: string;

  @Column({ type: 'time' })
  endTime!: string;

  @Column({ type: 'integer' })
  slotDurationMinutes!: number;
}
