import { Request, Response } from 'express';
import { WorkScheduleService } from '../services/WorkScheduleService';

export class WorkScheduleController {
  constructor(
    private readonly service: WorkScheduleService,
  ) {}

  replaceAll = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const doctorId = Number(req.params.doctorId);
    const { shifts } = req.body ?? {};

    const result = await this.service.replaceAll(
      doctorId,
      shifts,
    );

    res.status(200).json(result);
  };

  findByDoctorId = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const doctorId = Number(req.params.doctorId);

    const result = await this.service.findByDoctorId(
      doctorId,
    );

    res.status(200).json(result);
  };
}
