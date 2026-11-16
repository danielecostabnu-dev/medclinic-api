
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMedicalRecords1793657767367
  implements MigrationInterface
{
  name = 'CreateMedicalRecords1793657767367';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "medical_records" (
        "id" SERIAL NOT NULL,
        "patient_id" integer NOT NULL,
        "doctor_id" integer NOT NULL,
        "text" text NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE
          NOT NULL DEFAULT now(),

        CONSTRAINT "PK_medical_records"
          PRIMARY KEY ("id"),

        CONSTRAINT "FK_medical_records_patient"
          FOREIGN KEY ("patient_id")
          REFERENCES "patients"("id")
          ON DELETE RESTRICT,

        CONSTRAINT "FK_medical_records_doctor"
          FOREIGN KEY ("doctor_id")
          REFERENCES "doctors"("id")
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_medical_records_patient"
      ON "medical_records" ("patient_id", "createdAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "medical_records"
    `);
  }
}
