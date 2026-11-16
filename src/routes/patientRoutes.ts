import { Router } from 'express';
import { PatientRepository } from '../repositories/PatientRepository';
import { PatientService } from '../services/PatientService';
import { PatientController } from '../controllers/PatientController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { UserRole } from '../entities/User';

import { MedicalRecordRepository } from '../repositories/MedicalRecordRepository';
import { MedicalRecordService } from '../services/MedicalRecordService';
import { MedicalRecordController } from '../controllers/MedicalRecordController';

const patientRoutes = Router();

const repository = new PatientRepository();
const service = new PatientService(repository);
const controller = new PatientController(service);

// Prontuários médicos
const medicalRecordRepository = new MedicalRecordRepository();
const medicalRecordService = new MedicalRecordService(
  medicalRecordRepository,
);
const medicalRecordController = new MedicalRecordController(
  medicalRecordService,
);

// Todas as rotas exigem autenticação JWT.
patientRoutes.use(authMiddleware);

// Cadastrar paciente: admin ou secretary
patientRoutes.post(
  '/',
  authorizeRoles(UserRole.ADMIN, UserRole.SECRETARY),
  controller.create,
);

// Listar pacientes: qualquer usuário autenticado
patientRoutes.get('/', controller.findAll);

// Registrar prontuário: somente médico com vínculo
patientRoutes.post(
  '/:patientId/medical-records',
  authorizeRoles(UserRole.DOCTOR),
  medicalRecordController.create,
);

// Consultar prontuários: médico com vínculo ou administrador
patientRoutes.get(
  '/:patientId/medical-records',
  authorizeRoles(UserRole.DOCTOR, UserRole.ADMIN),
  medicalRecordController.findByPatientId,
);

// Consultar paciente por ID
patientRoutes.get('/:id', controller.findById);

// Alterar paciente: admin ou secretary
patientRoutes.patch(
  '/:id',
  authorizeRoles(UserRole.ADMIN, UserRole.SECRETARY),
  controller.update,
);

// Excluir paciente: somente admin
patientRoutes.delete(
  '/:id',
  authorizeRoles(UserRole.ADMIN),
  controller.delete,
);

export { patientRoutes };
