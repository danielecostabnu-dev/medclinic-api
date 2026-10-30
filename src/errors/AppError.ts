export const errorStatus = {
  DADOS_INVALIDOS: 400,
  NAO_AUTENTICADO: 401,
  CREDENCIAIS_INVALIDAS: 401,
  ACESSO_NEGADO: 403,
  RECURSO_NAO_ENCONTRADO: 404,
  EMAIL_JA_CADASTRADO: 409,
  CPF_JA_CADASTRADO: 409,
  CRM_JA_CADASTRADO: 409,
  HORARIO_INDISPONIVEL: 409,
  PACIENTE_INDISONIVEL: 409,
  HORARIO_FORA_DA_ESCALA: 422,
  TRANSICAO_INVALIDA: 422,
} as const;

export type AppErrorCode = keyof typeof errorStatus;

export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}
