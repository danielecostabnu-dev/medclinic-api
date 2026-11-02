import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePatients1793657767363 implements MigrationInterface {
    name = 'CreatePatients1793657767363'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "patients" ("id" SERIAL NOT NULL, "name" character varying(150) NOT NULL, "cpf" character varying(11) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_5947301223f5a908fd5e372b0fb" UNIQUE ("cpf"), CONSTRAINT "PK_a7f0b9fcbb3469d5ec0b0aceaa7" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "patients"`);
    }

}
