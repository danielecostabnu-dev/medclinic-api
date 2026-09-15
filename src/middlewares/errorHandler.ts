import { NextFunction, Request, Response } from 'express';

export function errorHandler(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
): Response {
  console.error(error);

  return response.status(500).json({
    message: error.message || 'Erro interno do servidor',
  });
}