import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/UserRepository';
import { User, UserRole } from '../entities/User';

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export class UserService {
  async create(data: CreateUserData): Promise<User> {
    const existingUser = await userRepository.findOneBy({
      email: data.email,
    });

    if (existingUser) {
      throw new Error('E-mail já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role ?? UserRole.ATTENDANT,
    });

    return userRepository.save(user);
  }
}