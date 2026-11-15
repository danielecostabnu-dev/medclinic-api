import { Router } from 'express';
import { AppointmentRepository } from '../repositories/AppointmentRepository';
import { AppointmentService } from '../services/AppointmentService';
import { AppointmentController } from '../controllers/AppointmentController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { UserRole } from '../entities/User';

export const appointmentRoutes = Router();

const repository = new AppointmentRepository();
const service = new AppointmentService(repository);
const controller = new AppointmentController(service);

appointmentRoutes.use(authMiddleware);

appointmentRoutes.post(
  '/',
  authorizeRoles(UserRole.ADMIN, UserRole.SECRETARY),
  controller.create,
);
