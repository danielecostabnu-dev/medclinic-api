import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { userRepository } from '../repositories/UserRepository';

const userService = new UserService();

export class UserController {
  async create(request: Request, response: Response): Promise<Response> {
    const { name, email, password, role } = request.body;

    const user = await userService.create({
      name,
      email,
      password,
      role,
    });

    return response.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }
    async me(request: AuthRequest, response: Response): Promise<Response> {
    const user = await userRepository.findOneBy({
      id: request.user!.id,
    });

    if (!user) {
      return response.status(404).json({ message: 'Usuário não encontrado' });
    }

    return response.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }
}