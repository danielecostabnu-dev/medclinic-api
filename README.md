# MedClinic API

API backend desenvolvida como Mini-Projeto Final do curso de Back-End.

O projeto simula o módulo de gerenciamento de usuários de uma clínica, com cadastro, autenticação e autorização por perfil de acesso.

## Tecnologias

- Node.js
- TypeScript
- Express
- PostgreSQL
- TypeORM
- bcrypt
- JSON Web Token (JWT)
- dotenv

## Funcionalidades

- Cadastro de usuários
- Senhas armazenadas com hash utilizando bcrypt
- Autenticação por e-mail e senha
- Geração de token JWT
- Rota protegida para consulta do próprio usuário
- Controle de acesso baseado em perfil (RBAC)
- Perfis Administrador e Atendente
- Rota administrativa exclusiva para Administrador
- Tratamento centralizado de erros

## Estrutura do projeto

O projeto foi organizado em camadas:

- `config`: configurações da aplicação e banco de dados
- `controllers`: tratamento das requisições HTTP
- `entities`: entidades do TypeORM
- `middlewares`: autenticação, autorização e tratamento de erros
- `repositories`: acesso aos dados
- `routes`: definição das rotas
- `services`: regras de negócio

## Configuração do ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=medclinic
JWT_SECRET=sua_chave_secreta


## API publicada

A MedClinic API está publicada no Render.

URL pública:
https://medclinic-api-fb4a.onrender.com

Endpoint de saúde:
GET /api/v1/health

Autenticação:
POST /api/v1/auth/login

## Funcionalidades implementadas

- Autenticação JWT.
- Autorização baseada em perfis.
- Cadastro e gerenciamento de pacientes.
- PostgreSQL gerenciado no Neon com SSL.
- Migrations com TypeORM.
- Testes unitários automatizados com Vitest.
- Validação de Pull Requests pelo GitHub Actions.

## Testes

npm test
npm run test:cov
npm run build

A cobertura verificada dos serviços implementados foi
superior a 80%.

## Estado atual

Os módulos de médicos, escalas, agendamentos e
prontuários ainda não foram concluídos.
