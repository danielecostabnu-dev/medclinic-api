# MedClinic API — Módulo 02 | SENAI

API REST desenvolvida em Node.js e TypeScript para gerenciamento de uma clínica médica, como parte do projeto de Back-End do SENAI.

O sistema permite administrar usuários, pacientes, médicos, escalas de atendimento, calendário, agendamentos e prontuários, com autenticação e controle de acesso por perfil.

## Tecnologias utilizadas

- Node.js e TypeScript
- Express
- PostgreSQL (Neon)
- TypeORM e migrations
- JWT e bcrypt
- Vitest
- Swagger / OpenAPI
- Pino para logs estruturados
- Dockerfile para preparação da execução em contêiner
- Render para publicação da API
- GitHub Actions

## Funcionalidades implementadas

- Autenticação por e-mail e senha, com geração de token JWT.
- Controle de acesso por perfil: administrador, secretária e médico.
- Cadastro e gerenciamento de usuários.
- Cadastro e gerenciamento de pacientes com CPF único.
- Cadastro de médicos com CRM único.
- Configuração de escalas e horários de atendimento.
- Consulta ao calendário médico e horários disponíveis.
- Agendamento e cancelamento de consultas.
- Validação para evitar conflitos de agendamento.
- Registro e consulta de prontuários médicos com controle de acesso.
- Tratamento de erros e validações das regras de negócio.
- Documentação interativa dos endpoints com Swagger.
- Logs estruturados para acompanhamento das requisições.

## API publicada

A MedClinic API está publicada no Render.

**URL da API:**
https://medclinic-api-fb4a.onrender.com

**Documentação Swagger:**
https://medclinic-api-fb4a.onrender.com/v1/docs/

**Verificação de funcionamento:**
https://medclinic-api-fb4a.onrender.com/api/v1/health

**Autenticação:**
`POST /api/v1/auth/login`

## Configuração do ambiente

1. Instale o Node.js e as dependências do projeto.
2. Configure o arquivo `.env` com as variáveis de ambiente necessárias, tomando como referência o `.env.example` do repositório.
3. Utilize uma conexão PostgreSQL compatível.
4. Configure uma chave secreta JWT segura.
5. Execute as migrations antes de utilizar as funcionalidades que dependem do banco de dados.

Não publique senhas, tokens ou dados reais de conexão no repositório.

## Comandos do projeto

Instalar dependências:

```bash
npm install
```

Compilar o TypeScript:

```bash
npm run build
```

Executar testes:

```bash
npm test
```

Verificar cobertura dos testes:

```bash
npm run test:cov
```

## Testes automatizados

Foram executados **147 testes com sucesso**, distribuídos em 8 suítes.

Cobertura apurada dos serviços incluídos na execução dos testes:

- Instruções: 97,79%
- Ramificações: 96,37%
- Funções: 100%
- Linhas: 97,76%

Esses percentuais correspondem aos serviços avaliados na configuração de cobertura utilizada, não necessariamente a todo o código do repositório.

## Docker

O projeto contém `Dockerfile` e `.dockerignore` para preparação da execução em contêiner.

A construção e execução da imagem Docker ainda não foram validadas localmente.

## Organização do projeto

O desenvolvimento foi acompanhado por meio de um quadro público no GitHub Projects, com as principais funcionalidades e entregas registradas.

**Quadro público:**
https://github.com/users/danielecostabnu-dev/projects/4/views/1

**Branch com o código atualizado:**
https://github.com/danielecostabnu-dev/medclinic-api/tree/feat/agendamentos

## Observações

O código atualizado desta entrega está disponível na branch `feat/agendamentos`.

A aplicação utiliza PostgreSQL hospedado no Neon e está publicada no Render, com documentação Swagger disponível publicamente.
