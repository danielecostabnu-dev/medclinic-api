import { Request, Response } from 'express';
import { Doctor } from '../entities/Doctor';
import { DoctorService } from '../services/DoctorService';
import { AppError } from '../errors/AppError';

export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
  ) {}

  private toResponse(doctor: Doctor) {
    return {
      id: doctor.id,
      crm: doctor.crm,
      user: {
        id: doctor.user.id,
        name: doctor.user.name,
        email: doctor.user.email,
        roles: doctor.user.roles,
      },
    };
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, crm } = req.body ?? {};

    const doctor = await this.doctorService.create({
      name,
      email,
      password,
      crm,
    });

    res.status(201).json(this.toResponse(doctor));
  };

  findAll = async (req: Request, res: Response): Promise<void> => {
    const { page, pageSize, name } = req.query;

    const parseNumber = (
      value: unknown,
      defaultValue: number,
    ): number => {
      if (value === undefined) return defaultValue;

      if (
        typeof value !== 'string' ||
        !/^\d+$/.test(value)
      ) {
        throw new AppError(
          'DADOS_INVALIDOS',
          'Paginação inválida.',
        );
      }

      return Number(value);
    };

    if (name !== undefined && typeof name !== 'string') {
      throw new AppError(
        'DADOS_INVALIDOS',
        'Filtro name inválido.',
      );
    }

    const result = await this.doctorService.findAll(
      parseNumber(page, 1),
      parseNumber(pageSize, 20),
      name,
    );

    res.status(200).json({
      data: result.data.map((doctor) =>
        this.toResponse(doctor),
      ),
      meta: result.meta,
    });
  };

  findById = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    const doctor = await this.doctorService.findById(id);

    res.status(200).json(this.toResponse(doctor));
  };
}
