import { NextFunction, Response } from 'express';
import { AuthRequest } from './authMiddleware';
import { UserRole } from '../entities/User';

export function adminMiddleware(
  request: AuthRequest,
  response: Response,
  next: NextFunction,
): Response | void {
  if (request.user?.role !== UserRole.ADMIN) {
    return response.status(403).json({
      message: 'Acesso permitido somente para Administrador',
    });
  }

  next();
}