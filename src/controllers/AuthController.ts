import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

export class AuthController {
  async login(request: Request, response: Response): Promise<Response> {
    const { email, password } = request.body;

    const token = await authService.login(email, password);

    return response.status(200).json({
      token,
    });
  }
}