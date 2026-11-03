
import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { userRepository } from '../repositories/UserRepository';
import { UserRole } from '../entities/User';
import { AppError } from '../errors/AppError';

const userService = new UserService();

export class UserController {
  async create(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { name, email, password, roles } = request.body ?? {};

    const validRoles = Object.values(UserRole);

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof password !== 'string' ||
      !password ||
      !Array.isArray(roles) ||
      roles.length === 0 ||
      !roles.every(
        (role: unknown) => validRoles.includes(role as UserRole),
      )
    ) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'Dados de cadastro inválidos.',
      );
    }

    const user = await userService.create({
      name: name.trim(),
      email: email.trim(),
      password,
      roles: roles as UserRole[],
    });

    return response.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    });
  }

  async me(
    request: AuthRequest,
    response: Response,
  ): Promise<Response> {
    if (!request.user) {
      throw new AppError(
        'NAO_AUTENTICADO',
        'Autenticação necessária.',
      );
    }

    const user = await userRepository.findOneBy({
      id: request.user.id,
    });

    if (!user) {
      throw new AppError(
        'RECURSO_NAO_ENCONTRADO',
        'Usuário não encontrado.',
      );
    }

    return response.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    });
  }
}
