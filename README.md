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