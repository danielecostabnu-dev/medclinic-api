
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../repositories/UserRepository', () => ({
  userRepository: {
    findOneBy: vi.fn(),
  },
}));

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/UserRepository';
import { AuthService } from './AuthService';

describe('AuthService', () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'segredo-de-teste-seguro';
  });

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
  });

  it('deve rejeitar e-mail não cadastrado', async () => {
    vi.mocked(userRepository.findOneBy).mockResolvedValue(null);

    const service = new AuthService();

    await expect(
      service.login('inexistente@teste.com', 'senha'),
    ).rejects.toMatchObject({
      code: 'CREDENCIAIS_INVALIDAS',
    });
  });

  it('deve rejeitar senha incorreta', async () => {
    const hash = await bcrypt.hash('senha-correta', 4);

    vi.mocked(userRepository.findOneBy).mockResolvedValue({
      id: 1,
      name: 'Administrador',
      email: 'admin@teste.com',
      password: hash,
      roles: ['admin'],
    } as Awaited<ReturnType<typeof userRepository.findOneBy>>);

    const service = new AuthService();

    await expect(
      service.login('admin@teste.com', 'senha-errada'),
    ).rejects.toMatchObject({
      code: 'CREDENCIAIS_INVALIDAS',
    });
  });

  it('deve gerar JWT com credenciais válidas', async () => {
    const hash = await bcrypt.hash('senha-correta', 4);

    vi.mocked(userRepository.findOneBy).mockResolvedValue({
      id: 1,
      name: 'Administrador',
      email: 'admin@teste.com',
      password: hash,
      roles: ['admin'],
    } as Awaited<ReturnType<typeof userRepository.findOneBy>>);

    const service = new AuthService();
    const token = await service.login(
      'admin@teste.com',
      'senha-correta',
    );

    const payload = jwt.verify(
      token,
      'segredo-de-teste-seguro',
    );

    expect(payload).toMatchObject({
      sub: '1',
      roles: ['admin'],
    });
  });

  it('deve rejeitar configuração sem JWT_SECRET', async () => {
    delete process.env.JWT_SECRET;

    const hash = await bcrypt.hash('senha-correta', 4);

    vi.mocked(userRepository.findOneBy).mockResolvedValue({
      id: 1,
      name: 'Administrador',
      email: 'admin@teste.com',
      password: hash,
      roles: ['admin'],
    } as Awaited<ReturnType<typeof userRepository.findOneBy>>);

    const service = new AuthService();

    await expect(
      service.login('admin@teste.com', 'senha-correta'),
    ).rejects.toThrow('JWT_SECRET não configurado.');
  });
});
