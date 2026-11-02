
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/UserRepository';
import { AppError } from '../errors/AppError';

export class AuthService {
  async login(email: string, password: string): Promise<string> {
    const user = await userRepository.findOneBy({ email });

    if (!user) {
      throw new AppError(
        'CREDENCIAIS_INVALIDAS',
        'E-mail ou senha inválidos.',
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password,
    );

    if (!passwordMatches) {
      throw new AppError(
        'CREDENCIAIS_INVALIDAS',
        'E-mail ou senha inválidos.',
      );
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET não configurado.');
    }

    return jwt.sign(
      { roles: user.roles },
      secret,
      {
        subject: String(user.id),
        expiresIn: '1h',
      },
    );
  }
}
