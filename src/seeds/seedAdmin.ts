
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';

async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Administrador';

  if (!email || !password || password.length < 12) {
    throw new Error(
      'Configure ADMIN_EMAIL e ADMIN_PASSWORD (mínimo 12 caracteres).',
    );
  }

  try {
    await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOneBy({ email });

    if (existingUser) {
      console.log('Usuário já existente. Nenhuma alteração realizada.');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = userRepository.create({
      name,
      email,
      password: hashedPassword,
      roles: [UserRole.ADMIN],
    });

    await userRepository.save(admin);

    console.log('Administrador inicial criado com sucesso.');
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

seedAdmin().catch((error: unknown) => {
  console.error('Falha ao executar seed do administrador:', error);
  process.exitCode = 1;
});
