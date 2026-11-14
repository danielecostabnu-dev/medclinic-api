
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkScheduleService } from './WorkScheduleService';
import {
  IWorkScheduleRepository,
  WorkShiftInput,
} from '../repositories/IWorkScheduleRepository';

describe('WorkScheduleService', () => {
  let repository: IWorkScheduleRepository;
  let service: WorkScheduleService;

  const validShift: WorkShiftInput = {
    weekDay: 2,
    startTime: '08:00',
    endTime: '12:00',
    slotDurationMinutes: 30,
  };

  beforeEach(() => {
    repository = {
      doctorExists: vi.fn().mockResolvedValue(true),
      findByDoctorId: vi.fn().mockResolvedValue([]),
      replaceAll: vi.fn().mockResolvedValue(undefined),
    };

    service = new WorkScheduleService(repository);
  });

  it('deve cadastrar um turno válido', async () => {
    const result = await service.replaceAll(1, [validShift]);

    expect(result.shifts).toEqual([validShift]);
    expect(repository.replaceAll).toHaveBeenCalledWith(
      1,
      [validShift],
    );
  });

  it('deve aceitar turnos consecutivos', async () => {
    const secondShift: WorkShiftInput = {
      ...validShift,
      startTime: '12:00',
      endTime: '18:00',
    };

    await expect(
      service.replaceAll(1, [validShift, secondShift]),
    ).resolves.toBeDefined();
  });

  it('deve recusar turnos sobrepostos', async () => {
    const overlappingShift: WorkShiftInput = {
      ...validShift,
      startTime: '11:00',
      endTime: '15:00',
    };

    await expect(
      service.replaceAll(1, [validShift, overlappingShift]),
    ).rejects.toThrow(
      'Turnos do mesmo dia não podem se sobrepor.',
    );

    expect(repository.replaceAll).not.toHaveBeenCalled();
  });

  it('deve aceitar turnos em dias diferentes', async () => {
    const otherDay: WorkShiftInput = {
      ...validShift,
      weekDay: 3,
    };

    const result = await service.replaceAll(
      1,
      [validShift, otherDay],
    );

    expect(result.shifts).toHaveLength(2);
  });

  it('deve recusar dia da semana inválido', async () => {
    await expect(
      service.replaceAll(1, [{ ...validShift, weekDay: 7 }]),
    ).rejects.toThrow('Turno inválido.');
  });

  it('deve recusar horário inválido', async () => {
    await expect(
      service.replaceAll(1, [
        { ...validShift, startTime: '25:00' },
      ]),
    ).rejects.toThrow('Turno inválido.');
  });

  it('deve recusar horário final anterior ao inicial', async () => {
    await expect(
      service.replaceAll(1, [
        { ...validShift, endTime: '07:00' },
      ]),
    ).rejects.toThrow('Turno inválido.');
  });

  it('deve recusar duração zero', async () => {
    await expect(
      service.replaceAll(1, [
        { ...validShift, slotDurationMinutes: 0 },
      ]),
    ).rejects.toThrow('Turno inválido.');
  });

  it('deve permitir remover toda a escala', async () => {
    const result = await service.replaceAll(1, []);

    expect(result.shifts).toEqual([]);
    expect(repository.replaceAll).toHaveBeenCalledWith(1, []);
  });

  it('deve recusar médico inexistente', async () => {
    vi.mocked(repository.doctorExists).mockResolvedValue(false);

    await expect(
      service.replaceAll(999, [validShift]),
    ).rejects.toThrow('Médico não encontrado.');
  });

  it('deve recusar ID de médico inválido', async () => {
    await expect(
      service.replaceAll(0, [validShift]),
    ).rejects.toThrow('ID do médico inválido.');
  });

  it('deve consultar a escala de um médico', async () => {
    vi.mocked(repository.findByDoctorId).mockResolvedValue([
      {
        id: 1,
        weekDay: 2,
        startTime: '08:00:00',
        endTime: '12:00:00',
        slotDurationMinutes: 30,
      } as Awaited<
        ReturnType<IWorkScheduleRepository['findByDoctorId']>
      >[number],
    ]);

    const result = await service.findByDoctorId(1);

    expect(result.shifts).toEqual([validShift]);
  });

  it('deve retornar lista vazia quando não há escala', async () => {
    const result = await service.findByDoctorId(1);

    expect(result.shifts).toEqual([]);
  });
});

