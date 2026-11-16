import express from 'express';
import 'dotenv/config';
import swaggerUi from 'swagger-ui-express';
import { AppDataSource } from './config/database';
import { swaggerSpec } from './config/swagger';
import { userRoutes } from './routes/userRoutes';
import { authRoutes } from './routes/authRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { patientRoutes } from './routes/patientRoutes';
import { doctorRoutes } from './routes/doctorRoutes';
import { appointmentRoutes } from './routes/appointmentRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './config/logger';

const app = express();

// Registra as requisições HTTP em formato JSON.
app.use(requestLogger);

app.use(express.json());

// Documentação interativa da API
app.use('/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Verificação de funcionamento da API
app.get('/api/v1/health', (_request, response) => {
  return response.status(200).json({ status: 'ok' });
});

// Rotas da API
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/appointments', appointmentRoutes);

// Tratamento centralizado de erros
app.use(errorHandler);

const port = Number(process.env.PORT) || 3000;

async function bootstrap(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('Conexão com PostgreSQL realizada com sucesso');

    app.listen(port, '0.0.0.0', () => {
      console.log(`MedClinic API executando na porta ${port}`);
    });
  } catch (error: unknown) {
    console.error('Erro ao iniciar MedClinic API:', error);
    process.exitCode = 1;
  }
}

void bootstrap();
