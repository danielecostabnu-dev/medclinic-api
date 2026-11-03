import express from 'express';
import 'dotenv/config';
import { AppDataSource } from './config/database';
import { userRoutes } from './routes/userRoutes';
import { authRoutes } from './routes/authRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { patientRoutes } from './routes/patientRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());

app.get('/api/v1/health', (_request, response) => {
  return response.status(200).json({ status: 'ok' });
});

// Rotas da etapa anterior, temporariamente mantidas
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/patients', patientRoutes);

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
