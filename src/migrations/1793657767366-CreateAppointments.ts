import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAppointments1793657767366
  implements MigrationInterface
{
  name = 'CreateAppointments1793657767366';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "appointments" (
        "id" SERIAL NOT NULL,
        "doctor_id" integer NOT NULL,
        "patient_id" integer NOT NULL,
        "startsAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "endsAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'scheduled',

        CONSTRAINT "PK_appointments" PRIMARY KEY ("id"),

        CONSTRAINT "FK_appointments_doctors"
          FOREIGN KEY ("doctor_id")
          REFERENCES "doctors"("id")
          ON DELETE RESTRICT,

        CONSTRAINT "FK_appointments_patients"
          FOREIGN KEY ("patient_id")
          REFERENCES "patients"("id")
          ON DELETE RESTRICT,

        CONSTRAINT "CHK_appointments_period"
          CHECK ("startsAt" < "endsAt"),

        CONSTRAINT "CHK_appointments_status"
          CHECK ("status" IN (
            'scheduled',
            'in_progress',
            'done',
            'cancelled'
          ))
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_appointments_doctor_period"
      ON "appointments" ("doctor_id", "startsAt", "endsAt")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_appointments_patient_period"
      ON "appointments" ("patient_id", "startsAt", "endsAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "appointments"`);
  }
}
