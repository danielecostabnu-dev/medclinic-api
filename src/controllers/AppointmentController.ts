import { Request, Response } from 'express';
import { AppointmentService } from '../services/AppointmentService';
import { AppError } from '../errors/AppError';

export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const { doctorId, patientId, startsAt } = req.body ?? {};

    if (
      typeof startsAt !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(
        startsAt,
      )
    ) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'Informe startsAt em ISO 8601 com fuso horário.',
      );
    }

    const result = await this.appointmentService.create({
      doctorId,
      patientId,
      startsAt: new Date(startsAt),
    });

    res.status(201).json(result);
  };
}
