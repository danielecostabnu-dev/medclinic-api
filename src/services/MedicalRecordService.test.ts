import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MedicalRecordService } from './MedicalRecordService';
import { UserRole } from '../entities/User';
import { IMedicalRecordRepository } from '../repositories/IMedicalRecordRepository';
import { MedicalRecord } from '../entities/MedicalRecord';

describe('MedicalRecordService', () => {
  const admin = { id: 1, roles: [UserRole.ADMIN] };
  const doctor = { id: 2, roles: [UserRole.DOCTOR] };
  const secretary = { id: 3, roles: [UserRole.SECRETARY] };

  const createdAt = new Date('2026-11-16T12:00:00.000Z');

  const record = {
    id: 10,
    patient: { id: 1 },
    doctor: { id: 5 },
    text: 'Registro clinico ficticio.',
    createdAt,
  } as MedicalRecord;

  const patientExists = vi.fn();
  const findDoctorIdByUserId = vi.fn();
  const hasPatientLink = vi.fn();
  const create = vi.fn();
  const findByPatientId = vi.fn();

  const repository = {
    patientExists,
    findDoctorIdByUserId,
    hasPatientLink,
    create,
    findByPatientId,
  } as unknown as IMedicalRecordRepository;

  const service = new MedicalRecordService(repository);

  beforeEach(() => {
    vi.resetAllMocks();

    patientExists.mockResolvedValue(true);
    findDoctorIdByUserId.mockResolvedValue(5);
    hasPatientLink.mockResolvedValue(true);
    create.mockResolvedValue(record);
    findByPatientId.mockResolvedValue([record]);
  });

  describe('create', () => {
    it('permite ao medico com vinculo criar prontuario', async () => {
      const result = await service.create(
        1,
        'Registro clinico ficticio.',
        doctor,
      );

      expect(result).toEqual({
        id: 10,
        patientId: 1,
        doctorId: 5,
        text: record.text,
        createdAt: createdAt.toISOString(),
      });

      expect(findDoctorIdByUserId).toHaveBeenCalledWith(2);
      expect(hasPatientLink).toHaveBeenCalledWith(5, 1);
      expect(create).toHaveBeenCalledOnce();
    });

    it('remove espacos do texto antes de gravar', async () => {
      await service.create(
        1,
        '  Registro clinico ficticio.  ',
        doctor,
      );

      expect(create).toHaveBeenCalledWith(
        5,
        1,
        'Registro clinico ficticio.',
      );
    });

    it.each([0, -1, 1.5, Number.NaN])(
      'rejeita ID invalido: %s',
      async (patientId) => {
        await expect(
          service.create(patientId, 'Texto', doctor),
        ).rejects.toThrow();

        expect(create).not.toHaveBeenCalled();
      },
    );

    it.each(['', ' ', '\n', '\t'])(
      'rejeita texto vazio ou com espacos',
      async (text) => {
        await expect(
          service.create(1, text, doctor),
        ).rejects.toThrow();

        expect(create).not.toHaveBeenCalled();
      },
    );

    it('rejeita texto que nao seja string', async () => {
      await expect(
        service.create(
          1,
          null as unknown as string,
          doctor,
        ),
      ).rejects.toThrow();
    });

    it('impede administrador de cadastrar prontuario', async () => {
      await expect(
        service.create(1, 'Texto', admin),
      ).rejects.toThrow();

      expect(create).not.toHaveBeenCalled();
    });

    it('impede secretaria de cadastrar prontuario', async () => {
      await expect(
        service.create(1, 'Texto', secretary),
      ).rejects.toThrow();

      expect(create).not.toHaveBeenCalled();
    });

    it('impede usuario sem perfil medico', async () => {
      await expect(
        service.create(1, 'Texto', { id: 4, roles: [] }),
      ).rejects.toThrow();
    });

    it('impede perfil medico combinado com admin', async () => {
      await expect(
        service.create(1, 'Texto', {
          id: 4,
          roles: [UserRole.DOCTOR, UserRole.ADMIN],
        }),
      ).rejects.toThrow();
    });

    it('impede perfil medico combinado com secretaria', async () => {
      await expect(
        service.create(1, 'Texto', {
          id: 4,
          roles: [UserRole.DOCTOR, UserRole.SECRETARY],
        }),
      ).rejects.toThrow();
    });

    it('rejeita paciente inexistente', async () => {
      patientExists.mockResolvedValue(false);

      await expect(
        service.create(1, 'Texto', doctor),
      ).rejects.toThrow();

      expect(create).not.toHaveBeenCalled();
    });

    it('rejeita medico sem cadastro vinculado ao usuario', async () => {
      findDoctorIdByUserId.mockResolvedValue(null);

      await expect(
        service.create(1, 'Texto', doctor),
      ).rejects.toThrow();

      expect(create).not.toHaveBeenCalled();
    });

    it('rejeita medico sem vinculo com paciente', async () => {
      hasPatientLink.mockResolvedValue(false);

      await expect(
        service.create(1, 'Texto', doctor),
      ).rejects.toThrow();

      expect(hasPatientLink).toHaveBeenCalledWith(5, 1);
      expect(create).not.toHaveBeenCalled();
    });
  });

  describe('findByPatientId', () => {
    it('permite ao administrador consultar prontuarios', async () => {
      const result = await service.findByPatientId(1, admin);

      expect(result.total).toBe(1);
      expect(result.data[0]).toEqual({
        id: 10,
        patientId: 1,
        doctorId: 5,
        text: record.text,
        createdAt: createdAt.toISOString(),
      });

      expect(findDoctorIdByUserId).not.toHaveBeenCalled();
      expect(findByPatientId).toHaveBeenCalledWith(1);
    });

    it('permite consulta pelo medico com vinculo', async () => {
      const result = await service.findByPatientId(1, doctor);

      expect(result.total).toBe(1);
      expect(hasPatientLink).toHaveBeenCalledWith(5, 1);
    });

    it('retorna lista vazia quando nao existem prontuarios', async () => {
      findByPatientId.mockResolvedValue([]);

      const result = await service.findByPatientId(1, admin);

      expect(result).toEqual({
        data: [],
        total: 0,
      });
    });

    it.each([0, -1, 1.5, Number.NaN])(
      'rejeita ID invalido na consulta: %s',
      async (patientId) => {
        await expect(
          service.findByPatientId(patientId, admin),
        ).rejects.toThrow();

        expect(findByPatientId).not.toHaveBeenCalled();
      },
    );

    it('impede consulta pela secretaria', async () => {
      await expect(
        service.findByPatientId(1, secretary),
      ).rejects.toThrow();

      expect(findByPatientId).not.toHaveBeenCalled();
    });

    it('impede usuario sem perfil autorizado', async () => {
      await expect(
        service.findByPatientId(1, { id: 4, roles: [] }),
      ).rejects.toThrow();
    });

    it('impede secretaria mesmo com perfil de medico', async () => {
      await expect(
        service.findByPatientId(1, {
          id: 4,
          roles: [UserRole.DOCTOR, UserRole.SECRETARY],
        }),
      ).rejects.toThrow();
    });

    it('rejeita paciente inexistente', async () => {
      patientExists.mockResolvedValue(false);

      await expect(
        service.findByPatientId(1, admin),
      ).rejects.toThrow();

      expect(findByPatientId).not.toHaveBeenCalled();
    });

    it('impede consulta por medico sem cadastro', async () => {
      findDoctorIdByUserId.mockResolvedValue(null);

      await expect(
        service.findByPatientId(1, doctor),
      ).rejects.toThrow();
    });

    it('impede consulta por medico sem vinculo', async () => {
      hasPatientLink.mockResolvedValue(false);

      await expect(
        service.findByPatientId(1, doctor),
      ).rejects.toThrow();

      expect(findByPatientId).not.toHaveBeenCalled();
    });

    it('permite ao administrador consultar sem vinculo medico', async () => {
      hasPatientLink.mockResolvedValue(false);

      const result = await service.findByPatientId(1, admin);

      expect(result.total).toBe(1);
      expect(hasPatientLink).not.toHaveBeenCalled();
    });
  });
});
