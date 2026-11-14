import { AppDataSource } from '../config/database';
import { Doctor } from '../entities/Doctor';
import { User, UserRole } from '../entities/User';
import {
  CreateDoctorData,
  IDoctorRepository,
} from './IDoctorRepository';

export class DoctorRepository implements IDoctorRepository {
  async findByCrm(crm: string): Promise<Doctor | null> {
    return AppDataSource.getRepository(Doctor).findOne({
      where: { crm },
      relations: { user: true },
    });
  }

  async emailExists(email: string): Promise<boolean> {
    return AppDataSource.getRepository(User).exists({
  where: { email },
});
  }

  async createAtomic(data: CreateDoctorData): Promise<Doctor> {
    return AppDataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        name: data.name,
        email: data.email,
        password: data.passwordHash,
        roles: [UserRole.DOCTOR],
      });

      await manager.save(User, user);

      const doctor = manager.create(Doctor, {
        crm: data.crm,
        user,
      });

      return manager.save(Doctor, doctor);
    });
  }

  async findById(id: number): Promise<Doctor | null> {
    return AppDataSource.getRepository(Doctor).findOne({
      where: { id },
      relations: { user: true },
    });
  }

  async findAll(
    page: number,
    pageSize: number,
    name?: string,
  ): Promise<[Doctor[], number]> {
    const query = AppDataSource.getRepository(Doctor)
      .createQueryBuilder('doctor')
      .innerJoinAndSelect('doctor.user', 'user');

    if (name) {
      query.where('LOWER(user.name) LIKE LOWER(:name)', {
        name: `%${name}%`,
      });
    }

    return query
      .orderBy('doctor.id', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
  }
}
