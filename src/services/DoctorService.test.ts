import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DoctorService } from './DoctorService';
import { Doctor } from '../entities/Doctor';
import { IDoctorRepository } from '../repositories/IDoctorRepository';
import { UserRole } from '../entities/User';

describe('DoctorService', () => {
  let service: DoctorService;
  let repository: IDoctorRepository;

  const validInput = {
    name: 'Dra. Helena Souza',
    email: 'helena@medclinic.com',
    password: 'SenhaForte@123',
    crm: 'CRM-SC-54321',
  };

  const doctor = {
    id: 1,
    crm: validInput.crm,
    user: {
      id: 2,
      name: validInput.name,
      email: validInput.email,
      roles: [UserRole.DOCTOR],
    },
  } as Doctor;

  beforeEach(() => {
    repository = {
      findByCrm: vi.fn().mockResolvedValue(null),
      emailExists: vi.fn().mockResolvedValue(false),
      createAtomic: vi.fn().mockResolvedValue(doctor),
      findById: vi.fn().mockResolvedValue(doctor),
      findAll: vi.fn().mockResolvedValue([[doctor], 1]),
    };

    service = new DoctorService(repository);
  });

  it('deve cadastrar médico com dados válidos', async () => {
    const result = await service.create(validInput);

    expect(result.crm).toBe(validInput.crm);
    expect(result.user.roles).toContain(UserRole.DOCTOR);
    expect(repository.createAtomic).toHaveBeenCalledOnce();
  });

  it('deve enviar senha criptografada ao repositório', async () => {
    await service.create(validInput);

    expect(repository.createAtomic).toHaveBeenCalledWith(
      expect.objectContaining({
        email: validInput.email,
        crm: validInput.crm,
        passwordHash: expect.any(String),
      }),
    );

    const createMock = vi.mocked(repository.createAtomic);
    const savedData = createMock.mock.calls[0][0];

    expect(savedData.passwordHash).not.toBe(validInput.password);
  });

  it('deve recusar CRM duplicado', async () => {
    vi.mocked(repository.findByCrm).mockResolvedValue(doctor);

    await expect(service.create(validInput)).rejects.toThrow(
      'CRM já cadastrado.',
    );

    expect(repository.createAtomic).not.toHaveBeenCalled();
  });

  it('deve recusar e-mail duplicado', async () => {
    vi.mocked(repository.emailExists).mockResolvedValue(true);

    await expect(service.create(validInput)).rejects.toThrow(
      'E-mail já cadastrado.',
    );

    expect(repository.createAtomic).not.toHaveBeenCalled();
  });

  it('deve recusar nome vazio', async () => {
    await expect(
      service.create({ ...validInput, name: '' }),
    ).rejects.toThrow('Dados do médico inválidos.');

    expect(repository.createAtomic).not.toHaveBeenCalled();
  });

  it('deve recusar CRM vazio', async () => {
    await expect(
      service.create({ ...validInput, crm: '' }),
    ).rejects.toThrow('Dados do médico inválidos.');
  });

  it('deve consultar médico por ID', async () => {
    const result = await service.findById(1);

    expect(result.id).toBe(1);
  });

  it('deve recusar médico inexistente', async () => {
    vi.mocked(repository.findById).mockResolvedValue(null);

    await expect(service.findById(999)).rejects.toThrow(
      'Médico não encontrado.',
    );
  });

  it('deve listar médicos com paginação', async () => {
    const result = await service.findAll(1, 20);

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
    expect(result.meta.totalPages).toBe(1);
    });

  it('deve recusar ID inválido', async () => {
    await expect(service.findById(0)).rejects.toThrow(
      'ID inválido.',
    );
  });

  it('deve recusar paginação inválida', async () => {
    await expect(service.findAll(0, 20)).rejects.toThrow(
      'Filtros inválidos.',
    );
  });

  it('deve recusar senha vazia', async () => {
    await expect(
      service.create({ ...validInput, password: '' }),
    ).rejects.toThrow('Dados do médico inválidos.');
  });

  it('deve tratar CRM duplicado informado pelo banco', async () => {
    vi.mocked(repository.createAtomic).mockRejectedValue({
      code: '23505',
      constraint: 'UQ_doctors_crm',
    });

    await expect(service.create(validInput)).rejects.toThrow(
      'CRM já cadastrado.',
    );
  });

  });
