import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CalendarService } from './CalendarService';
import { AppDataSource } from '../config/database';
import { Doctor } from '../entities/Doctor';
import { WorkSchedule } from '../entities/WorkSchedule';
import {
  Appointment,
  AppointmentStatus,
} from '../entities/Appointment';

vi.mock('../config/database', () => ({
  AppDataSource: {
    getRepository: vi.fn(),
  },
}));

describe('CalendarService', () => {
  const service = new CalendarService();

  const doctorFindOneBy = vi.fn();
  const scheduleFind = vi.fn();
  const appointmentGetMany = vi.fn();

  const queryBuilder = {
    leftJoinAndSelect: vi.fn(),
    where: vi.fn(),
    andWhere: vi.fn(),
    orderBy: vi.fn(),
    getMany: appointmentGetMany,
  };

  beforeEach(() => {
    vi.resetAllMocks();

    queryBuilder.leftJoinAndSelect.mockReturnValue(queryBuilder);
    queryBuilder.where.mockReturnValue(queryBuilder);
    queryBuilder.andWhere.mockReturnValue(queryBuilder);
    queryBuilder.orderBy.mockReturnValue(queryBuilder);

    doctorFindOneBy.mockResolvedValue({ id: 1 });

    scheduleFind.mockResolvedValue([
      {
        weekDay: 1,
        startTime: '08:00:00',
        endTime: '12:00:00',
        slotDurationMinutes: 30,
      },
      {
        weekDay: 1,
        startTime: '14:00:00',
        endTime: '18:00:00',
        slotDurationMinutes: 30,
      },
    ]);

    appointmentGetMany.mockResolvedValue([
      {
        id: 10,
        patient: { id: 5 },
        startsAt: new Date('2026-11-16T11:00:00.000Z'),
        endsAt: new Date('2026-11-16T11:30:00.000Z'),
        status: AppointmentStatus.IN_PROGRESS,
      },
    ]);

    vi.mocked(AppDataSource.getRepository).mockImplementation(
      ((entity: unknown) => {
        if (entity === Doctor) {
          return { findOneBy: doctorFindOneBy };
        }

        if (entity === WorkSchedule) {
          return { find: scheduleFind };
        }

        if (entity === Appointment) {
          return {
            createQueryBuilder: () => queryBuilder,
          };
        }

        throw new Error('Entidade inesperada no teste');
  }) as unknown as typeof AppDataSource.getRepository,

    );
  });

  it('retorna a escala e os agendamentos do médico', async () => {
    const result = await service.findByDoctorId(
      1,
      '2026-11-16',
      '2026-11-20',
    );

    expect(result.workSchedule.shifts).toHaveLength(2);
    expect(result.appointments).toHaveLength(1);

    expect(result.workSchedule.shifts[0]).toEqual({
      weekDay: 1,
      startTime: '08:00',
      endTime: '12:00',
      slotDurationMinutes: 30,
    });

    expect(result.appointments[0]).toEqual({
      id: 10,
      patientId: 5,
      startsAt: '2026-11-16T11:00:00.000Z',
      endsAt: '2026-11-16T11:30:00.000Z',
      status: AppointmentStatus.IN_PROGRESS,
    });
  });

  it('retorna calendário vazio quando não existem escalas nem consultas', async () => {
    scheduleFind.mockResolvedValue([]);
    appointmentGetMany.mockResolvedValue([]);

    const result = await service.findByDoctorId(
      1,
      '2026-11-16',
      '2026-11-16',
    );

    expect(result).toEqual({
      workSchedule: { shifts: [] },
      appointments: [],
    });
  });

  it('consulta apenas agendamentos não cancelados', async () => {
    await service.findByDoctorId(
      1,
      '2026-11-16',
      '2026-11-20',
    );

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'appointment.status != :cancelled',
      { cancelled: AppointmentStatus.CANCELLED },
    );
  });

  it('aplica o filtro de período no calendário', async () => {
    await service.findByDoctorId(
      1,
      '2026-11-16',
      '2026-11-20',
    );

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      expect.stringContaining('BETWEEN'),
      { from: '2026-11-16', to: '2026-11-20' },
    );
  });

  it('retorna paciente indefinido quando não existe relação carregada', async () => {
    appointmentGetMany.mockResolvedValue([
      {
        id: 11,
        startsAt: new Date('2026-11-16T11:00:00.000Z'),
        endsAt: new Date('2026-11-16T11:30:00.000Z'),
        status: AppointmentStatus.SCHEDULED,
      },
    ]);

    const result = await service.findByDoctorId(
      1,
      '2026-11-16',
      '2026-11-16',
    );

    expect(result.appointments[0].patientId).toBeUndefined();
  });

  it.each([0, -1, 1.5, Number.NaN])(
    'rejeita ID de médico inválido: %s',
    async (doctorId) => {
      await expect(
        service.findByDoctorId(
          doctorId,
          '2026-11-16',
          '2026-11-20',
        ),
      ).rejects.toThrow();
    },
  );

  it.each([
    '16/11/2026',
    '2026-02-30',
    '2026-13-01',
    'data-invalida',
    '',
  ])('rejeita data inicial inválida: %s', async (from) => {
    await expect(
      service.findByDoctorId(1, from, '2026-11-20'),
    ).rejects.toThrow();
  });

  it('rejeita data final inválida', async () => {
    await expect(
      service.findByDoctorId(1, '2026-11-16', 'invalida'),
    ).rejects.toThrow();
  });

  it('rejeita data inicial que não seja string', async () => {
    await expect(
      service.findByDoctorId(
        1,
        null as unknown as string,
        '2026-11-20',
      ),
    ).rejects.toThrow();
  });

  it('rejeita data final que não seja string', async () => {
    await expect(
      service.findByDoctorId(
        1,
        '2026-11-16',
        null as unknown as string,
      ),
    ).rejects.toThrow();
  });

  it('rejeita período com data inicial posterior à final', async () => {
    await expect(
      service.findByDoctorId(
        1,
        '2026-11-20',
        '2026-11-16',
      ),
    ).rejects.toThrow();
  });

  it('rejeita período superior a 31 dias', async () => {
    await expect(
      service.findByDoctorId(
        1,
        '2026-11-01',
        '2026-12-10',
      ),
    ).rejects.toThrow();
  });

  it('aceita período de 31 dias inclusivos', async () => {
    const result = await service.findByDoctorId(
      1,
      '2026-11-01',
      '2026-12-01',
    );

    expect(result.workSchedule.shifts).toHaveLength(2);
  });

  it('rejeita médico não encontrado', async () => {
    doctorFindOneBy.mockResolvedValue(null);

    await expect(
      service.findByDoctorId(
        999,
        '2026-11-16',
        '2026-11-20',
      ),
    ).rejects.toThrow();

    expect(scheduleFind).not.toHaveBeenCalled();
  });
});
