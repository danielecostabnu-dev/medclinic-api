import { describe, it, expect, vi } from 'vitest';
import { PatientService } from './PatientService';
import { IPatientRepository } from '../repositories/IPatientRepository';

describe('PatientService', () => {
  it('deve rejeitar CPF com menos de 11 dígitos', async () => {
    const repository = {
      create: vi.fn(),
      findByCpf: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as IPatientRepository;

    const service = new PatientService(repository);

    await expect(
      service.create('Paciente Teste', '123'),
    ).rejects.toMatchObject({
      code: 'DADOS_INVALIDOS',
    });

    expect(repository.findByCpf).not.toHaveBeenCalled();
  });
  
  it('deve rejeitar nome vazio', async () => {
    const repository = {
      create: vi.fn(),
      findByCpf: vi.fn(),
    } as unknown as IPatientRepository;

    const service = new PatientService(repository);

    await expect(
      service.create('', '12345678901'),
    ).rejects.toMatchObject({
      code: 'DADOS_INVALIDOS',
    });
  });

  it('deve rejeitar CPF duplicado', async () => {
    const repository = {
      findByCpf: vi.fn().mockResolvedValue({
        id: 1,
        name: 'Paciente Existente',
        cpf: '12345678901',
      }),
      create: vi.fn(),
    } as unknown as IPatientRepository;

    const service = new PatientService(repository);

    await expect(
      service.create('Outro Paciente', '12345678901'),
    ).rejects.toMatchObject({
      code: 'CPF_JA_CADASTRADO',
    });

    expect(repository.create).not.toHaveBeenCalled();
  });

  it('deve cadastrar paciente válido', async () => {
    const patient = {
      id: 1,
      name: 'Maria Silva',
      cpf: '12345678901',
      createdAt: new Date(),
    };

    const repository = {
      findByCpf: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(patient),
    } as unknown as IPatientRepository;

    const service = new PatientService(repository);

    const result = await service.create(
      'Maria Silva',
      '12345678901',
    );

    expect(result).toEqual(patient);
    expect(repository.create).toHaveBeenCalledWith(
      'Maria Silva',
      '12345678901',
    );
  });

  it('deve rejeitar paciente inexistente', async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue(null),
    } as unknown as IPatientRepository;

    const service = new PatientService(repository);

    await expect(
      service.findById(999),
    ).rejects.toMatchObject({
      code: 'RECURSO_NAO_ENCONTRADO',
    });
  });

  it('deve rejeitar ID inválido', async () => {
    const repository = {
      findById: vi.fn(),
    } as unknown as IPatientRepository;

    const service = new PatientService(repository);

    await expect(
      service.findById(-1),
    ).rejects.toMatchObject({
      code: 'DADOS_INVALIDOS',
    });

    expect(repository.findById).not.toHaveBeenCalled();
  });

  it('deve consultar paciente existente', async () => {
    const patient = {
      id: 1,
      name: 'Maria Silva',
      cpf: '12345678901',
      createdAt: new Date(),
    };

    const repository = {
      findById: vi.fn().mockResolvedValue(patient),
    } as unknown as IPatientRepository;

    const service = new PatientService(repository);

    const result = await service.findById(1);

    expect(result).toEqual(patient);
    expect(repository.findById).toHaveBeenCalledWith(1);
  });

  it('deve rejeitar paginação inválida', async () => {
    const repository = {
      findAll: vi.fn(),
    } as unknown as IPatientRepository;

    const service = new PatientService(repository);

    await expect(
      service.findAll(0, 20),
    ).rejects.toMatchObject({
      code: 'DADOS_INVALIDOS',
    });

    expect(repository.findAll).not.toHaveBeenCalled();
  });

  it('deve listar pacientes com paginação', async () => {
    const patient = {
      id: 1,
      name: 'Maria Silva',
      cpf: '12345678901',
      createdAt: new Date(),
    };

    const repository = {
      findAll: vi.fn().mockResolvedValue([[patient], 1]),
    } as unknown as IPatientRepository;

    const service = new PatientService(repository);

    const result = await service.findAll(1, 20);

    expect(result.data).toEqual([patient]);
    expect(result.meta).toEqual({
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });
    expect(repository.findAll).toHaveBeenCalledWith(
      1,
      20,
      undefined,
    );
  });

  it('deve atualizar o nome do paciente', async () => {
    const patient = {
      id: 1,
      name: 'Maria Silva',
      cpf: '12345678901',
      createdAt: new Date(),
    };

    const repository = {
      findById: vi.fn().mockResolvedValue(patient),
      update: vi.fn().mockImplementation(async (p) => p),
    } as unknown as IPatientRepository;

    const service = new PatientService(repository);

    const result = await service.update(1, 'Maria Souza');

    expect(result.name).toBe('Maria Souza');
    expect(repository.update).toHaveBeenCalled();
  });

  it('deve excluir paciente existente', async () => {
    const patient = {
      id: 1,
      name: 'Maria Silva',
      cpf: '12345678901',
      createdAt: new Date(),
    };

    const repository = {
      findById: vi.fn().mockResolvedValue(patient),
      delete: vi.fn().mockResolvedValue(undefined),
    } as unknown as IPatientRepository;

    const service = new PatientService(repository);

    await service.delete(1);

    expect(repository.delete).toHaveBeenCalledWith(1);
  });

});
