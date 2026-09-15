import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/UserRepository';

export class AuthService {
  async login(email: string, password: string): Promise<string> {
    const user = await userRepository.findOneBy({ email });

    if (!user) {
      throw new Error('E-mail ou senha inválidos');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new Error('E-mail ou senha inválidos');
    }

    const token = jwt.sign(
      {
        role: user.role,
      },
      process.env.JWT_SECRET || 'medclinic_secret_2026',
      {
        subject: String(user.id),
        expiresIn: '1h',
      },
    );

    return token;
  }
}