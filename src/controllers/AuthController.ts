import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { AppError } from '../errors/AppError';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { email, password } = request.body ?? {};

    if (
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      throw new AppError(
        'DADOS_INVALIDOS',
        'E-mail e senha são obrigatórios.',
      );
    }

    const accessToken = await this.authService.login(
      email,
      password,
    );

    return response.status(200).json({ accessToken });
  }
}
