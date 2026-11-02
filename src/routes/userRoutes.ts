import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { UserRole } from '../entities/User';

const userRoutes = Router();
const userController = new UserController();

userRoutes.post(
  '/',
  authMiddleware,
  authorizeRoles(UserRole.ADMIN),
  async (request, response) => {
    await userController.create(request, response);
  },
);

userRoutes.get(
  '/me',
  authMiddleware,
  async (request, response) => {
    await userController.me(request, response);
  },
);

export { userRoutes };
