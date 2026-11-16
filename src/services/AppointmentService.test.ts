import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppointmentService } from './AppointmentService';
import { Appointment, AppointmentStatus } from '../entities/Appointment';
import { UserRole } from '../entities/User';
import { IAppointmentRepository } from '../repositories/IAppointmentRepository';

describe('AppointmentService', () => {
  const admin = { id: 1, roles: [UserRole.ADMIN] };
  const secretary = { id: 2, roles: [UserRole.SECRETARY] };
  const doctor = { id: 3, roles: [UserRole.DOCTOR] };

  const startsAt = new Date('2026-11-16T11:00:00.000Z');
  const endsAt = new Date('2026-11-16T11:30:00.000Z');

  const appointment = (
    status: AppointmentStatus = AppointmentStatus.SCHEDULED,
  ): Appointment =>
    ({
      id: 1,
      doctor: { id: 10 },
      patient: { id: 20 },
      startsAt,
      endsAt,
      status,
    }) as Appointment;

  const create = vi.fn();
  const findById = vi.fn();
  const findDoctorIdByUserId = vi.fn();
  const findAll = vi.fn();
  const updateStatus = vi.fn();

  const repository = {
    create,
    findById,
    findDoctorIdByUserId,
    findAll,
    updateStatus,
  } as unknown as IAppointmentRepository;

  const service = new AppointmentService(repository);

  beforeEach(() => {
    vi.resetAllMocks();
    create.mockResolvedValue(appointment());
    findById.mockResolvedValue(appointment());
    findDoctorIdByUserId.mockResolvedValue(10);
    findAll.mockResolvedValue([[appointment()], 1]);
    updateStatus.mockResolvedValue(appointment(AppointmentStatus.CANCELLED));
  });

  describe('create', () => {
    it('cria um agendamento válido', async () => {
      const result = await service.create({
        doctorId: 10,
        patientId: 20,
        startsAt,
      });

      expect(result).toMatchObject({
        id: 1,
        doctorId: 10,
        patientId: 20,
        status: AppointmentStatus.SCHEDULED,
      });

      expect(result.startsAt).toBe(startsAt.toISOString());
      expect(create).toHaveBeenCalledOnce();
    });

    it.each([
      { doctorId: 0, patientId: 20, startsAt },
      { doctorId: 1.5, patientId: 20, startsAt },
      { doctorId: 10, patientId: -1, startsAt },
      { doctorId: 10, patientId: 1.5, startsAt },
      { doctorId: 10, patientId: 20, startsAt: new Date('invalida') },
    ])('rejeita dados inválidos: %#', async (input) => {
      await expect(service.create(input)).rejects.toThrow();
      expect(create).not.toHaveBeenCalled();
    });

    it('rejeita uma data que não seja Date', async () => {
      await expect(
        service.create({
          doctorId: 10,
          patientId: 20,
          startsAt: '2026-11-16' as unknown as Date,
        }),
      ).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('permite consulta pelo administrador', async () => {
      const result = await service.findById(1, admin);

      expect(result.id).toBe(1);
      expect(findDoctorIdByUserId).not.toHaveBeenCalled();
    });

    it('permite consulta pela secretaria', async () => {
      const result = await service.findById(1, secretary);

      expect(result.patientId).toBe(20);
    });

    it('permite consulta ao médico responsável', async () => {
      const result = await service.findById(1, doctor);

      expect(result.doctorId).toBe(10);
      expect(findDoctorIdByUserId).toHaveBeenCalledWith(3);
    });

    it('impede consulta por outro médico', async () => {
      findDoctorIdByUserId.mockResolvedValue(99);

      await expect(service.findById(1, doctor)).rejects.toThrow();
    });

    it('rejeita ID inválido', async () => {
      await expect(service.findById(0, admin)).rejects.toThrow();
    });

    it('rejeita ID decimal', async () => {
      await expect(service.findById(1.5, admin)).rejects.toThrow();
    });

    it('rejeita agendamento inexistente', async () => {
      findById.mockResolvedValue(null);

      await expect(service.findById(1, admin)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('lista agendamentos com paginação', async () => {
      const result = await service.findAll({}, 1, 10, admin);

      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('aplica filtros válidos', async () => {
      const filters = {
        doctorId: 10,
        patientId: 20,
        status: AppointmentStatus.SCHEDULED,
        from: '2026-11-01',
        to: '2026-11-16',
      };

      await service.findAll(filters, 2, 10, admin);

      expect(findAll).toHaveBeenCalledWith(filters, 2, 10);
    });

    it('restringe a lista ao médico autenticado', async () => {
      await service.findAll({ doctorId: 99 }, 1, 10, doctor);

      expect(findAll).toHaveBeenCalledWith(
        { doctorId: 10 },
        1,
        10,
      );
    });

    it('retorna lista vazia quando o usuário médico não tem cadastro', async () => {
      findDoctorIdByUserId.mockResolvedValue(null);

      const result = await service.findAll({}, 1, 10, doctor);

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
      });

      expect(findAll).not.toHaveBeenCalled();
    });

    it('permite resultado vazio', async () => {
      findAll.mockResolvedValue([[], 0]);

      const result = await service.findAll({}, 1, 10, admin);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it.each([
      [0, 10],
      [1.5, 10],
      [1, 0],
      [1, 101],
      [1, 1.5],
    ])('rejeita paginação inválida (%s, %s)', async (page, pageSize) => {
      await expect(
        service.findAll({}, page, pageSize, admin),
      ).rejects.toThrow();
    });

    it.each([
      { doctorId: 0 },
      { doctorId: 1.5 },
      { patientId: 0 },
      { patientId: -2 },
    ])('rejeita filtro de ID inválido: %#', async (filters) => {
      await expect(
        service.findAll(filters, 1, 10, admin),
      ).rejects.toThrow();
    });

    it('rejeita status inválido', async () => {
      await expect(
        service.findAll({ status: 'qualquer' }, 1, 10, admin),
      ).rejects.toThrow();
    });

    it.each([
      '16/11/2026',
      '2026-02-30',
      '2026-13-01',
    ])('rejeita data inicial inválida: %s', async (from) => {
      await expect(
        service.findAll({ from }, 1, 10, admin),
      ).rejects.toThrow();
    });

    it('rejeita data final inválida', async () => {
      await expect(
        service.findAll({ to: 'data-invalida' }, 1, 10, admin),
      ).rejects.toThrow();
    });

    it('rejeita período invertido', async () => {
      await expect(
        service.findAll(
          { from: '2026-11-20', to: '2026-11-16' },
          1,
          10,
          admin,
        ),
      ).rejects.toThrow();
    });

    it('rejeita período superior a 31 dias', async () => {
      await expect(
        service.findAll(
          { from: '2026-01-01', to: '2026-03-01' },
          1,
          10,
          admin,
        ),
      ).rejects.toThrow();
    });
  });

  describe('updateStatus', () => {
    it('permite ao administrador cancelar consulta agendada', async () => {
      const result = await service.updateStatus(
        1,
        AppointmentStatus.CANCELLED,
        admin,
      );

      expect(result.status).toBe(AppointmentStatus.CANCELLED);
      expect(updateStatus).toHaveBeenCalledWith(
        1,
        AppointmentStatus.SCHEDULED,
        AppointmentStatus.CANCELLED,
      );
    });

    it('permite à secretaria cancelar consulta agendada', async () => {
      await service.updateStatus(
        1,
        AppointmentStatus.CANCELLED,
        secretary,
      );

      expect(updateStatus).toHaveBeenCalledOnce();
    });

    it('permite ao médico responsável cancelar consulta agendada', async () => {
      await service.updateStatus(
        1,
        AppointmentStatus.CANCELLED,
        doctor,
      );

      expect(updateStatus).toHaveBeenCalledOnce();
    });

    it('permite ao médico responsável iniciar o atendimento', async () => {
      updateStatus.mockResolvedValue(
        appointment(AppointmentStatus.IN_PROGRESS),
      );

      const result = await service.updateStatus(
        1,
        AppointmentStatus.IN_PROGRESS,
        doctor,
      );

      expect(result.status).toBe(AppointmentStatus.IN_PROGRESS);
    });

    it('permite ao médico responsável concluir o atendimento', async () => {
      findById.mockResolvedValue(
        appointment(AppointmentStatus.IN_PROGRESS),
      );
      updateStatus.mockResolvedValue(
        appointment(AppointmentStatus.DONE),
      );

      const result = await service.updateStatus(
        1,
        AppointmentStatus.DONE,
        doctor,
      );

      expect(result.status).toBe(AppointmentStatus.DONE);
    });

    it('impede secretaria de iniciar atendimento', async () => {
      await expect(
        service.updateStatus(
          1,
          AppointmentStatus.IN_PROGRESS,
          secretary,
        ),
      ).rejects.toThrow();
    });

    it('impede alteração por médico de outra consulta', async () => {
      findDoctorIdByUserId.mockResolvedValue(99);

      await expect(
        service.updateStatus(
          1,
          AppointmentStatus.CANCELLED,
          doctor,
        ),
      ).rejects.toThrow();
    });

    it('rejeita ID inválido', async () => {
      await expect(
        service.updateStatus(
          0,
          AppointmentStatus.CANCELLED,
          admin,
        ),
      ).rejects.toThrow();
    });

    it('rejeita status inválido', async () => {
      await expect(
        service.updateStatus(
          1,
          'invalido' as AppointmentStatus,
          admin,
        ),
      ).rejects.toThrow();
    });

    it('rejeita agendamento inexistente', async () => {
      findById.mockResolvedValue(null);

      await expect(
        service.updateStatus(
          1,
          AppointmentStatus.CANCELLED,
          admin,
        ),
      ).rejects.toThrow();
    });

    it('impede concluir consulta ainda agendada', async () => {
      await expect(
        service.updateStatus(
          1,
          AppointmentStatus.DONE,
          admin,
        ),
      ).rejects.toThrow();
    });

    it('impede alterar consulta concluída', async () => {
      findById.mockResolvedValue(
        appointment(AppointmentStatus.DONE),
      );

      await expect(
        service.updateStatus(
          1,
          AppointmentStatus.CANCELLED,
          admin,
        ),
      ).rejects.toThrow();
    });

    it('impede alterar consulta cancelada', async () => {
      findById.mockResolvedValue(
        appointment(AppointmentStatus.CANCELLED),
      );

      await expect(
        service.updateStatus(
          1,
          AppointmentStatus.IN_PROGRESS,
          admin,
        ),
      ).rejects.toThrow();
    });

    it('trata registro que desapareceu durante a atualização', async () => {
      updateStatus.mockResolvedValue(null);

      await expect(
        service.updateStatus(
          1,
          AppointmentStatus.CANCELLED,
          admin,
        ),
      ).rejects.toThrow();
    });
  });
});
