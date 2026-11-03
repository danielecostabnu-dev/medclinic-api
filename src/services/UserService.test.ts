import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../repositories/UserRepository', () => ({
  userRepository: {
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  },
}));

import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/UserRepository';
import { UserRole } from '../entities/User';
import { UserService } from './UserService';

describe('UserService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('deve rejeitar e-mail já cadastrado', async () => {
    vi.mocked(userRepository.findOneBy).mockResolvedValue({
      id: 1,
      name: 'Usuário Existente',
      email: 'teste@medclinic.com',
      password: 'hash',
      roles: [UserRole.SECRETARY],
    } as Awaited<ReturnType<typeof userRepository.findOneBy>>);

    const service = new UserService();

    await expect(
      service.create({
        name: 'Novo Usuário',
        email: 'teste@medclinic.com',
        password: 'SenhaForte@123',
        roles: [UserRole.SECRETARY],
      }),
    ).rejects.toMatchObject({
      code: 'EMAIL_JA_CADASTRADO',
    });

    expect(userRepository.create).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('deve cadastrar usuário com senha criptografada', async () => {
    vi.mocked(userRepository.findOneBy).mockResolvedValue(null);

    const userData = {
      name: 'Joana Secretária',
      email: 'joana@medclinic.com',
      password: 'SenhaForte@123',
      roles: [UserRole.SECRETARY],
    };

    const savedUser = {
      id: 2,
      ...userData,
      password: 'hash-da-senha',
    };

    vi.mocked(userRepository.create).mockReturnValue(
      savedUser as ReturnType<typeof userRepository.create>,
    );

    vi.mocked(userRepository.save).mockResolvedValue(
      savedUser as Awaited<ReturnType<typeof userRepository.save>>,
    );

    const service = new UserService();

    const result = await service.create(userData);

    expect(result.id).toBe(2);
    expect(userRepository.findOneBy).toHaveBeenCalledWith({
      email: 'joana@medclinic.com',
    });

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Joana Secretária',
        email: 'joana@medclinic.com',
        roles: [UserRole.SECRETARY],
        password: expect.any(String),
      }),
    );

    const createdData = vi.mocked(userRepository.create).mock.calls[0][0];
    const hashedPassword = (
      createdData as { password: string }
    ).password;

    expect(hashedPassword).not.toBe('SenhaForte@123');
    expect(
      await bcrypt.compare('SenhaForte@123', hashedPassword),
    ).toBe(true);

    expect(userRepository.save).toHaveBeenCalled();
  });

  it('deve salvar o usuário criado no repositório', async () => {
    vi.mocked(userRepository.findOneBy).mockResolvedValue(null);

    const savedUser = {
      id: 3,
      name: 'Carlos',
      email: 'carlos@medclinic.com',
      password: 'hash',
      roles: [UserRole.DOCTOR],
    };

    vi.mocked(userRepository.create).mockReturnValue(
      savedUser as ReturnType<typeof userRepository.create>,
    );

    vi.mocked(userRepository.save).mockResolvedValue(
      savedUser as Awaited<ReturnType<typeof userRepository.save>>,
    );

    const service = new UserService();

    const result = await service.create({
      name: 'Carlos',
      email: 'carlos@medclinic.com',
      password: 'SenhaForte@123',
      roles: [UserRole.DOCTOR],
    });

    expect(userRepository.save).toHaveBeenCalledWith(savedUser);
    expect(result).toEqual(savedUser);
  });
});
