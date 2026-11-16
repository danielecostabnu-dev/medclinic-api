
import { Response } from 'express';
import { MedicalRecordService } from '../services/MedicalRecordService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { AppError } from '../errors/AppError';

export class MedicalRecordController {
  constructor(
    private readonly service: MedicalRecordService,
  ) {}

  create = async (
    req: AuthRequest,
    res: Response,
  ): Promise<void> => {
    if (!req.user) {
      throw new AppError(
        'NAO_AUTENTICADO',
        'Usuário não autenticado.',
      );
    }

    const patientId = Number(req.params.patientId);
    const { text } = req.body ?? {};

    const result = await this.service.create(
      patientId,
      text,
      req.user,
    );

    res.status(201).json(result);
  };

  findByPatientId = async (
    req: AuthRequest,
    res: Response,
  ): Promise<void> => {
    if (!req.user) {
      throw new AppError(
        'NAO_AUTENTICADO',
        'Usuário não autenticado.',
      );
    }

    const patientId = Number(req.params.patientId);

    const result = await this.service.findByPatientId(
      patientId,
      req.user,
    );

    res.status(200).json(result);
  };
}
