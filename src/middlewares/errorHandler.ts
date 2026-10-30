
import { NextFunction, Request, Response } from 'express';
import { AppError, errorStatus } from '../errors/AppError';

export function errorHandler(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
): Response {
  if (error instanceof AppError) {
    const statusCode = errorStatus[error.code];

    return response.status(statusCode).json({
      statusCode,
      error: error.code,
      message: error.message,
    });
  }

  console.error('Erro interno:', error);

  return response.status(500).json({
    statusCode: 500,
    error: 'ERRO_INTERNO',
    message: 'Erro interno do servidor.',
  });
}
