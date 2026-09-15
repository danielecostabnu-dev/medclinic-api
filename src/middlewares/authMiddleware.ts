import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  sub: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export function authMiddleware(
  request: AuthRequest,
  response: Response,
  next: NextFunction,
): Response | void {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return response.status(401).json({ message: 'Token não informado' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'medclinic_secret_2026',
    ) as TokenPayload;

    request.user = {
      id: Number(decoded.sub),
      role: decoded.role,
    };

    next();
  } catch {
    return response.status(401).json({ message: 'Token inválido' });
  }
}