import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/authMiddleware';

const userRoutes = Router();
const userController = new UserController();

userRoutes.post('/', (request, response) =>
  userController.create(request, response),
);
userRoutes.get('/me', authMiddleware, (request, response) =>
  userController.me(request, response),
);
export { userRoutes };