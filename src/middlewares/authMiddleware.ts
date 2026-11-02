
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserRole } from '../entities/User';
import { AppError } from '../errors/AppError';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    roles: UserRole[];
  };
}

export function authMiddleware(
  request: AuthRequest,
  _response: Response,
  next: NextFunction,
): void {
  const header = request.headers.authorization;

  if (!header || !/^Bearer \S+$/.test(header)) {
    return next(new AppError(
      'NAO_AUTENTICADO',
      'Token não informado ou malformado.',
    ));
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next(new Error('JWT_SECRET não configurado.'));
  }

  try {
    const token = header.substring(7);
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === 'string' ||
      !isValidPayload(decoded)
    ) {
      throw new Error('Payload JWT inválido');
    }

    request.user = {
      id: Number(decoded.sub),
      roles: decoded.roles,
    };

    next();
  } catch {
    next(new AppError(
      'NAO_AUTENTICADO',
      'Token inválido ou expirado.',
    ));
  }
}

function isValidPayload(
  payload: JwtPayload,
): payload is JwtPayload & {
  sub: string;
  roles: UserRole[];
} {
  const validRoles: readonly string[] = Object.values(UserRole);

  return (
    typeof payload.sub === 'string' &&
    /^\d+$/.test(payload.sub) &&
    Number.isSafeInteger(Number(payload.sub)) &&
    Number(payload.sub) > 0 &&
    Array.isArray(payload.roles) &&
    payload.roles.length > 0 &&
    payload.roles.every(
      (role: unknown) =>
        typeof role === 'string' &&
        validRoles.includes(role),
    )
  );
}
