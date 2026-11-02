import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/UserRepository';
import { User, UserRole } from '../entities/User';
import { AppError } from '../errors/AppError';

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  roles: UserRole[];
}

export class UserService {
  async create(data: CreateUserData): Promise<User> {
    const existingUser = await userRepository.findOneBy({
      email: data.email,
    });

    if (existingUser) {
      throw new AppError(
        'EMAIL_JA_CADASTRADO',
        'Este e-mail já está cadastrado.',
      );
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      10,
    );

    const user = userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      roles: data.roles,
    });

    return userRepository.save(user);
  }
}
