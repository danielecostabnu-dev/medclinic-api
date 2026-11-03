import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { User } from '../entities/User';
import { Patient } from '../entities/Patient';

import { CreateUsers1793625739466 } from '../migrations/1793625739466-CreateUsers';
import { CreatePatients1793657767363 } from '../migrations/1793657767363-CreatePatients';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  synchronize: false,
  logging: false,

  entities: [
    User,
    Patient,
  ],

  migrations: [
    CreateUsers1793625739466,
    CreatePatients1793657767363,
  ],
});
