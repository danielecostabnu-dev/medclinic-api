import { Request, Response } from 'express';
import { AppointmentService } from '../services/AppointmentService';
import { AppError } from '../errors/AppError';
import { AuthRequest } from '../middlewares/authMiddleware';

export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
  ) {}

  // Cadastrar um agendamento
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

  // Consultar um agendamento pelo ID
  findById = async (
    req: AuthRequest,
    res: Response,
  ): Promise<void> => {
    if (!req.user) {
      throw new AppError(
        'NAO_AUTENTICADO',
        'Usuário não autenticado.',
      );
    }

    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'ID do agendamento inválido.',
      );
    }

    const result = await this.appointmentService.findById(
      id,
      req.user,
    );

    res.status(200).json(result);
  };


  // Listar agendamentos com filtros e paginação
  findAll = async (
    req: AuthRequest,
    res: Response,
  ): Promise<void> => {
    if (!req.user) {
      throw new AppError(
        'NAO_AUTENTICADO',
        'Usuário não autenticado.',
      );
    }

    const query = req.query;

    const doctorId =
      query.doctorId === undefined
        ? undefined
        : Number(query.doctorId);

    const patientId =
      query.patientId === undefined
        ? undefined
        : Number(query.patientId);

    const page =
      query.page === undefined ? 1 : Number(query.page);

    const pageSize =
      query.pageSize === undefined ? 10 : Number(query.pageSize);

    const result = await this.appointmentService.findAll(
      {
        doctorId,
        patientId,
        status: query.status as string | undefined,
        from: query.from as string | undefined,
        to: query.to as string | undefined,
      },
      page,
      pageSize,
      req.user,
    );

    res.status(200).json(result);
  };


  // Alterar o status de um agendamento
  updateStatus = async (
    req: AuthRequest,
    res: Response,
  ): Promise<void> => {
    if (!req.user) {
      throw new AppError(
        'NAO_AUTENTICADO',
        'Usuário não autenticado.',
      );
    }

    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'ID do agendamento inválido.',
      );
    }

    const { status } = req.body ?? {};

    const result = await this.appointmentService.updateStatus(
      id,
      status,
      req.user,
    );

    res.status(200).json(result);
  };

}
