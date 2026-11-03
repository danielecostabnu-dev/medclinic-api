import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { UserRole } from '../entities/User';

const adminRoutes = Router();

adminRoutes.get(
  '/ping',
  authMiddleware,
  authorizeRoles(UserRole.ADMIN),
  (_request, response) => {
    return response.status(200).json({
      message: 'Acesso administrativo autorizado',
    });
  },
);

export { adminRoutes };
