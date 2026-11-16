import { Request, Response } from 'express';
import { CalendarService } from '../services/CalendarService';
import { AppError } from '../errors/AppError';

export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
  ) {}

  findByDoctorId = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const doctorId = Number(req.params.doctorId);
    const { from, to } = req.query;

    if (
      typeof from !== 'string' ||
      typeof to !== 'string'
    ) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'Informe as datas from e to no formato YYYY-MM-DD.',
      );
    }

    const result = await this.calendarService.findByDoctorId(
      doctorId,
      from,
      to,
    );

    res.status(200).json(result);
  };
}
