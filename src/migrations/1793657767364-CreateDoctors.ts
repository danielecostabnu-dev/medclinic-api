import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDoctors1793657767364 implements MigrationInterface {
  name = 'CreateDoctors1793657767364';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "doctors" (
        "id" SERIAL NOT NULL,
        "crm" character varying(30) NOT NULL,
        "user_id" integer NOT NULL,
        CONSTRAINT "UQ_doctors_crm" UNIQUE ("crm"),
        CONSTRAINT "UQ_doctors_user_id" UNIQUE ("user_id"),
        CONSTRAINT "PK_doctors" PRIMARY KEY ("id"),
        CONSTRAINT "FK_doctors_users"
          FOREIGN KEY ("user_id")
          REFERENCES "users"("id")
          ON DELETE RESTRICT
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "doctors"`);
  }
}
