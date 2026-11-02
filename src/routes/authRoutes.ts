import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';

const authRoutes = Router();

const authService = new AuthService();
const authController = new AuthController(authService);

authRoutes.post('/login', async (request, response) => {
  await authController.login(request, response);
});

export { authRoutes };
