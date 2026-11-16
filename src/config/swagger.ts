import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'MedClinic API',
      version: '1.0.0',
      description:
        'API de gestão de clínica médica desenvolvida para o projeto SENAI.',
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API versão 1',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],

paths: {
  '/health': {
    get: {
      tags: ['Sistema'],
      summary: 'Verificar se a API está funcionando',
      security: [],
      responses: {
        '200': {
          description: 'API funcionando corretamente',
        },
      },
    },
  },
  '/auth/login': {
    post: {
      tags: ['Autenticação'],
      summary: 'Autenticar usuário',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string', format: 'password' },
              },
            },
          },
        },

'/patients': {
  get: {
    tags: ['Pacientes'],
    summary: 'Listar pacientes',
    responses: {
      '200': { description: 'Pacientes encontrados' },
      '401': { description: 'Não autenticado' },
    },
  },
  post: {
    tags: ['Pacientes'],
    summary: 'Cadastrar paciente',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['name', 'cpf'],
            properties: {
              name: { type: 'string' },
              cpf: { type: 'string' },
            },
          },
        },
      },
    },
    responses: {
      '201': { description: 'Paciente cadastrado' },
      '400': { description: 'Dados inválidos' },
      '403': { description: 'Acesso negado' },
    },
  },
},
'/doctors': {
  get: {
    tags: ['Médicos'],
    summary: 'Listar médicos',
    responses: {
      '200': { description: 'Médicos encontrados' },
    },
  },
  post: {
    tags: ['Médicos'],
    summary: 'Cadastrar médico',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['name', 'email', 'password', 'crm'],
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              password: { type: 'string', format: 'password' },
              crm: { type: 'string' },
            },
          },
        },
      },
    },
    responses: {
      '201': { description: 'Médico cadastrado' },
      '403': { description: 'Acesso negado' },
    },
  },
},
'/appointments': {
  get: {
    tags: ['Agendamentos'],
    summary: 'Listar agendamentos',
    responses: {
      '200': { description: 'Agendamentos encontrados' },
    },


'/doctors/{doctorId}/work-schedule': {
  get: {
    tags: ['Escalas médicas'],
    summary: 'Consultar escala do médico',
    parameters: [
      {
        name: 'doctorId',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      '200': { description: 'Escala encontrada' },
    },
  },
  put: {
    tags: ['Escalas médicas'],
    summary: 'Substituir escala do médico',
    parameters: [
      {
        name: 'doctorId',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              shifts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    weekDay: { type: 'integer' },
                    startTime: { type: 'string', example: '08:00' },
                    endTime: { type: 'string', example: '12:00' },
                    slotDurationMinutes: { type: 'integer', example: 30 },
                  },
                },
              },
            },
          },
        },
      },
    },
    responses: {
      '200': { description: 'Escala atualizada' },
      '400': { description: 'Dados inválidos' },
      '403': { description: 'Acesso negado' },
    },
  },
},
'/doctors/{doctorId}/calendar': {
  get: {
    tags: ['Calendário'],
    summary: 'Consultar calendário médico',
    parameters: [
      {
        name: 'doctorId',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
      },
      {
        name: 'from',
        in: 'query',
        required: true,
        schema: { type: 'string', format: 'date' },
      },
      {
        name: 'to',
        in: 'query',
        required: true,
        schema: { type: 'string', format: 'date' },
      },
    ],
    responses: {
      '200': { description: 'Calendário consultado' },
      '400': { description: 'Período inválido' },
    },
  },
},
'/appointments/{id}/status': {
  patch: {
    tags: ['Agendamentos'],
    summary: 'Alterar status ou cancelar agendamento',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['status'],
            properties: {
              status: {
                type: 'string',
                enum: ['scheduled', 'in_progress', 'done', 'cancelled'],
              },
            },
          },
        },
      },
    },
    responses: {
      '200': { description: 'Status atualizado' },
      '400': { description: 'Transição inválida' },
      '403': { description: 'Acesso negado' },
    },
  },
},
'/patients/{patientId}/medical-records': {
  get: {
    tags: ['Prontuários'],
    summary: 'Consultar prontuários do paciente',
    parameters: [
      {
        name: 'patientId',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      '200': { description: 'Prontuários encontrados' },
      '403': { description: 'Acesso negado' },
    },
  },
  post: {
    tags: ['Prontuários'],
    summary: 'Registrar prontuário médico',
    parameters: [
      {
        name: 'patientId',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['text'],
            properties: {
              text: { type: 'string' },
            },
          },
        },
      },
    },
    responses: {
      '201': { description: 'Prontuário registrado' },
      '400': { description: 'Texto inválido' },
      '403': { description: 'Médico sem permissão ou vínculo' },
    },
  },
},

  },
  post: {
    tags: ['Agendamentos'],
    summary: 'Criar agendamento',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['doctorId', 'patientId', 'startsAt'],
            properties: {
              doctorId: { type: 'integer' },
              patientId: { type: 'integer' },
              startsAt: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
        },
      },
    },
    responses: {
      '201': { description: 'Agendamento criado' },
      '409': { description: 'Horário indisponível' },
    },
  },
},

      },
      responses: {
        '200': {
          description: 'Login realizado com sucesso',
        },
        '401': {
          description: 'Credenciais inválidas',
        },
      },
    },
  },
},
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js'],
});
