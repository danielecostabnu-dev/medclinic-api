import express from 'express';
import 'dotenv/config';
import { AppDataSource } from './config/database';
import { userRoutes } from './routes/userRoutes';
import { authRoutes } from './routes/authRoutes';
import { adminRoutes } from './routes/adminRoutes';

const app = express();

app.use(express.json());
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

const port = Number(process.env.PORT) || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log('Conexão com PostgreSQL realizada com sucesso');

    app.listen(port, () => {
      console.log(`MedClinic API executando na porta ${port}`);
    });
  })
  .catch((error: unknown) => {
    console.error('Erro ao conectar com PostgreSQL:', error);
  });