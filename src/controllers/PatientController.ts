import { Request, Response } from 'express';
import { PatientService } from '../services/PatientService';
import { AppError } from '../errors/AppError';

export class PatientController {
  constructor(
    private readonly patientService: PatientService,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const { name, cpf } = req.body ?? {};

    const patient = await this.patientService.create(name, cpf);

    res.status(201).json(patient);
  };

  findAll = async (req: Request, res: Response): Promise<void> => {
    const { page, pageSize, name } = req.query;

    const parseNumber = (value: unknown, defaultValue: number): number => {
      if (value === undefined) return defaultValue;

      if (
        typeof value !== 'string' ||
        !/^\d+$/.test(value)
      ) {
        throw new AppError('DADOS_INVALIDOS', 'Paginação inválida.');
      }

      return Number(value);
    };

    if (name !== undefined && typeof name !== 'string') {
      throw new AppError('DADOS_INVALIDOS', 'Filtro name inválido.');
    }

    const result = await this.patientService.findAll(
      parseNumber(page, 1),
      parseNumber(pageSize, 20),
      name,
    );

    res.status(200).json(result);
  };

  findById = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    const patient = await this.patientService.findById(id);

    res.status(200).json(patient);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const { name } = req.body ?? {};

    const patient = await this.patientService.update(id, name);

    res.status(200).json(patient);
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    await this.patientService.delete(id);

    res.status(204).send();
  };
}
