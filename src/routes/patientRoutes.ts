import { Router } from 'express';
import { PatientRepository } from '../repositories/PatientRepository';
import { PatientService } from '../services/PatientService';
import { PatientController } from '../controllers/PatientController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { UserRole } from '../entities/User';

const patientRoutes = Router();

const repository = new PatientRepository();
const service = new PatientService(repository);
const controller = new PatientController(service);

// Todas as rotas exigem autenticação JWT.
patientRoutes.use(authMiddleware);

// Cadastrar: admin ou secretary
patientRoutes.post(
  '/',
  authorizeRoles(UserRole.ADMIN, UserRole.SECRETARY),
  controller.create,
);

// Listar: qualquer usuário autenticado
patientRoutes.get('/', controller.findAll);

// Consultar por ID: qualquer usuário autenticado
patientRoutes.get('/:id', controller.findById);

// Alterar: admin ou secretary
patientRoutes.patch(
  '/:id',
  authorizeRoles(UserRole.ADMIN, UserRole.SECRETARY),
  controller.update,
);

// Excluir: somente admin
patientRoutes.delete(
  '/:id',
  authorizeRoles(UserRole.ADMIN),
  controller.delete,
);

export { patientRoutes };
