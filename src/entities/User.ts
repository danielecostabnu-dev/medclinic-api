import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  SECRETARY = 'secretary',
  DOCTOR = 'doctor',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email!: string;

  @Column({ type: 'varchar' })
  password!: string;

  @Column({
    type: 'text',
    array: true,
  })
  roles!: UserRole[];
}
