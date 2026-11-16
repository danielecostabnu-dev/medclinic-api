
import pino from 'pino';
import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["x-api-key"]',
      'req.body',
      'res.body',
    ],
    remove: true,
  },
});

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const requestId = randomUUID();
    res.setHeader('X-Request-Id', requestId);
    return requestId;
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url?.split('?')[0],
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});
