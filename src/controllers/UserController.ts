import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

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
}