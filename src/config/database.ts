import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { User } from '../entities/User';
import { Patient } from '../entities/Patient';

import { CreateUsers1793625739466 } from '../migrations/1793625739466-CreateUsers';
import { CreatePatients1793657767363 } from '../migrations/1793657767363-CreatePatients';

const databaseUrl = process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
  type: 'postgres',

  ...(databaseUrl
    ? {
        url: databaseUrl,
        ssl: {
          rejectUnauthorized: true,
        },
      }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      }),

  synchronize: false,
  logging: false,

  entities: [User, Patient],

  migrations: [
    CreateUsers1793625739466,
    CreatePatients1793657767363,
  ],
});
