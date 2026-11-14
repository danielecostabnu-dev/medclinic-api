import { Router } from 'express';
import { DoctorRepository } from '../repositories/DoctorRepository';
import { DoctorService } from '../services/DoctorService';
import { DoctorController } from '../controllers/DoctorController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { UserRole } from '../entities/User';
import { WorkScheduleRepository } from '../repositories/WorkScheduleRepository';
import { WorkScheduleService } from '../services/WorkScheduleService';
import { WorkScheduleController } from '../controllers/WorkScheduleController';

const doctorRoutes = Router();

const repository = new DoctorRepository();
const service = new DoctorService(repository);
const controller = new DoctorController(service);
const scheduleRepository = new WorkScheduleRepository();
const scheduleService = new WorkScheduleService(scheduleRepository);
const scheduleController = new WorkScheduleController(scheduleService);

// Todas as rotas exigem autenticação JWT.
doctorRoutes.use(authMiddleware);
// Substituir escala: somente administrador
doctorRoutes.put(
  '/:doctorId/work-schedule',
  authorizeRoles(UserRole.ADMIN),
  scheduleController.replaceAll,
);

// Consultar escala: qualquer usuário autenticado
doctorRoutes.get(
  '/:doctorId/work-schedule',
  scheduleController.findByDoctorId,
);

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
