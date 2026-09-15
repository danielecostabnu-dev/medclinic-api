import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/roleMiddleware';

const adminRoutes = Router();

adminRoutes.get('/ping', authMiddleware, adminMiddleware, (_request, response) => {
  return response.status(200).json({
    message: 'Acesso administrativo autorizado',
  });
});

export { adminRoutes };