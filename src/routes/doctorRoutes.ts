import { Router } from 'express';
import { DoctorRepository } from '../repositories/DoctorRepository';
import { DoctorService } from '../services/DoctorService';
import { DoctorController } from '../controllers/DoctorController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { UserRole } from '../entities/User';

const doctorRoutes = Router();

const repository = new DoctorRepository();
const service = new DoctorService(repository);
const controller = new DoctorController(service);

// Todas as rotas exigem autenticação JWT.
doctorRoutes.use(authMiddleware);

// Cadastrar médico: somente administrador.
doctorRoutes.post(
  '/',
  authorizeRoles(UserRole.ADMIN),
  controller.create,
);

// Listar médicos: qualquer usuário autenticado.
doctorRoutes.get('/', controller.findAll);

// Consultar médico por ID: qualquer usuário autenticado.
doctorRoutes.get('/:id', controller.findById);

export { doctorRoutes };
