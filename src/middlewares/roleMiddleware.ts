import { NextFunction, Response } from 'express';
import { AuthRequest } from './authMiddleware';
import { UserRole } from '../entities/User';
import { AppError } from '../errors/AppError';

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (
    request: AuthRequest,
    _response: Response,
    next: NextFunction,
  ): void => {
    if (!request.user) {
      return next(
        new AppError(
          'NAO_AUTENTICADO',
          'Autenticação necessária.',
        ),
      );
    }

    const hasPermission = allowedRoles.some(
      (role) => request.user!.roles.includes(role),
    );

    if (!hasPermission) {
      return next(
        new AppError(
          'ACESSO_NEGADO',
          'Você não tem permissão para esta operação.',
        ),
      );
    }

    next();
  };
}
