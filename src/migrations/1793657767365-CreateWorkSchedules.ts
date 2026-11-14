import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWorkSchedules1793657767365
  implements MigrationInterface
{
  name = 'CreateWorkSchedules1793657767365';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "work_schedules" (
        "id" SERIAL NOT NULL,
        "doctor_id" integer NOT NULL,
        "weekDay" integer NOT NULL,
        "startTime" time NOT NULL,
        "endTime" time NOT NULL,
        "slotDurationMinutes" integer NOT NULL,
        CONSTRAINT "PK_work_schedules" PRIMARY KEY ("id"),
        CONSTRAINT "FK_work_schedules_doctors"
          FOREIGN KEY ("doctor_id")
          REFERENCES "doctors"("id")
          ON DELETE CASCADE,
        CONSTRAINT "CHK_work_schedules_weekday"
          CHECK ("weekDay" BETWEEN 0 AND 6),
        CONSTRAINT "CHK_work_schedules_time"
          CHECK ("startTime" < "endTime"),
        CONSTRAINT "CHK_work_schedules_duration"
          CHECK ("slotDurationMinutes" > 0)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "work_schedules"`);
  }
}
