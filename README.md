# Meus Mapas

Aplicação web para criar e gerenciar mapas personalizados com pontos georreferenciados.

> **Projeto de portfólio** desenvolvido para demonstrar habilidades em desenvolvimento full-stack com Next.js, PostgreSQL e boas práticas de arquitetura.

<!-- TODO: Adicionar link do deploy quando disponível -->
<!-- **[Ver Demo](https://meus-mapas.vercel.app)** -->

---

## Sumário

- [Meus Mapas](#meus-mapas)
  - [Sumário](#sumário)
  - [Demo](#demo)
  - [Funcionalidades](#funcionalidades)
    - [Mapas](#mapas)
    - [Pontos](#pontos)
    - [Validações](#validações)
    - [Soft Delete](#soft-delete)
  - [Regras de Negócio](#regras-de-negócio)
  - [Stack e Decisões Técnicas](#stack-e-decisões-técnicas)
    - [Por que SQL puro ao invés de ORM?](#por-que-sql-puro-ao-invés-de-orm)
  - [Arquitetura e Organização](#arquitetura-e-organização)
    - [Fluxo de Dados](#fluxo-de-dados)
  - [Modelo de Dados](#modelo-de-dados)
    - [Tabela `maps`](#tabela-maps)
    - [Tabela `points`](#tabela-points)
    - [Índices](#índices)
  - [API](#api)
    - [Mapas](#mapas-1)
    - [Pontos](#pontos-1)
    - [Exemplos de Payload](#exemplos-de-payload)
    - [Status Codes](#status-codes)
  - [Como Rodar Localmente](#como-rodar-localmente)
    - [Pré-requisitos](#pré-requisitos)
    - [Passo a Passo](#passo-a-passo)
  - [Variáveis de Ambiente](#variáveis-de-ambiente)
  - [Testes](#testes)
    - [Cobertura](#cobertura)
    - [Observações](#observações)
  - [Comandos Úteis](#comandos-úteis)
    - [Desenvolvimento](#desenvolvimento)
    - [Lint e Formatação](#lint-e-formatação)
    - [Banco de Dados](#banco-de-dados)
    - [Migrações](#migrações)

---

## Demo

<!-- TODO: Adicionar screenshots ou GIF -->
<!--
![Lista de Mapas](./docs/screenshots/lista-mapas.png)
![Detalhe do Mapa](./docs/screenshots/detalhe-mapa.png)
![Modal de Criação](./docs/screenshots/modal-criacao.png)
-->

**Principais telas:**

- Lista de mapas com busca e ordenação
- Visualização do mapa com pontos marcados (Leaflet + OpenStreetMap)
- Adição de pontos clicando diretamente no mapa
- Modais para criação/edição de mapas e pontos

---

## Funcionalidades

### Mapas

- Criar, listar, editar e excluir mapas
- Busca por nome
- Ordenação (mais recentes, mais antigos, A-Z, Z-A)
- Edição inline de nome e descrição

### Pontos

- Criar pontos clicando no mapa
- Busca de endereços (geocoding via Nominatim/OpenStreetMap)
- Listar, editar e excluir pontos individuais
- Exclusão em massa de todos os pontos de um mapa
- Visualização com marcadores interativos

### Validações

- Nome obrigatório (mapas e pontos)
- Nome único por mapa (mapas) e único por mapa (pontos)
- Latitude: -90 a 90
- Longitude: -180 a 180
- Descrição: máximo 40 caracteres

### Soft Delete

- Registros deletados são marcados com `deleted_at`
- GET padrão não retorna registros deletados
- Nomes podem ser reutilizados após exclusão

---

## Regras de Negócio

| Regra           | Descrição                                                        |
| --------------- | ---------------------------------------------------------------- |
| Mapa → N Pontos | Um mapa pode ter vários pontos associados                        |
| Cascade Delete  | Ao excluir um mapa, todos os pontos são excluídos (soft delete)  |
| Soft Delete     | Registros não são removidos fisicamente, apenas marcados         |
| Unicidade       | Nomes de mapas e pontos são únicos apenas entre registros ativos |
| Bloqueio        | Não é possível editar registros deletados (retorna 404)          |

---

## Stack e Decisões Técnicas

| Tecnologia                  | Uso                                       |
| --------------------------- | ----------------------------------------- |
| **Next.js 16** (App Router) | Framework React com SSR e API Routes      |
| **TypeScript**              | Tipagem estática                          |
| **Tailwind CSS**            | Estilização com design system customizado |
| **Leaflet + OpenStreetMap** | Mapas interativos (open source)           |
| **PostgreSQL**              | Banco de dados relacional                 |
| **node-pg-migrate**         | Migrações com SQL puro                    |
| **Zod**                     | Validação de schemas                      |
| **Vitest**                  | Testes unitários e de integração          |
| **Docker Compose**          | Containerização do banco de dados         |

### Por que SQL puro ao invés de ORM?

Optei por SQL puro com `node-pg-migrate` para ter controle total sobre as queries, aproveitar recursos específicos do PostgreSQL (como tipo `POINT` e índices parciais) e demonstrar conhecimento em SQL.

---

## Arquitetura e Organização

```
meus-mapas/
├── app/
│   ├── api/                    # API Routes (REST)
│   │   └── maps/
│   │       ├── route.ts        # GET /api/maps, POST /api/maps
│   │       └── [id]/
│   │           ├── route.ts    # GET/PUT/DELETE /api/maps/:id
│   │           └── points/
│   │               ├── route.ts      # GET/POST/DELETE /api/maps/:id/points
│   │               └── [pointId]/
│   │                   └── route.ts  # GET/PUT/DELETE /api/maps/:id/points/:pointId
│   ├── components/             # Componentes React
│   │   ├── maps/               # Componentes de mapas (lista, card, modal)
│   │   ├── points/             # Componentes de pontos (mapa, sidebar, modal)
│   │   └── ui/                 # Componentes genéricos (Button, Input, Modal)
│   ├── db/                     # Camada de acesso ao banco
│   │   ├── connection.ts       # Pool de conexões
│   │   ├── maps.ts             # Queries de mapas
│   │   └── points.ts           # Queries de pontos
│   ├── model/                  # Tipos/interfaces TypeScript
│   ├── validation/             # Schemas Zod e validações
│   └── maps/[id]/page.tsx      # Página de detalhe do mapa
├── lib/                        # Utilitários compartilhados
├── migrations/                 # Arquivos SQL de migração
└── public/                     # Assets estáticos
```

### Fluxo de Dados

```
Frontend (React) → API Route → DB Layer (SQL) → PostgreSQL
                 ← JSON      ← Objetos tipados ←
```

---

## Modelo de Dados

### Tabela `maps`

| Coluna        | Tipo        | Descrição                                      |
| ------------- | ----------- | ---------------------------------------------- |
| `id`          | UUID        | Chave primária (auto-gerado)                   |
| `name`        | TEXT        | Nome do mapa (obrigatório, único entre ativos) |
| `description` | TEXT        | Descrição opcional (máx. 40 caracteres)        |
| `created_at`  | TIMESTAMP   | Data de criação                                |
| `updated_at`  | TIMESTAMP   | Data da última atualização                     |
| `deleted_at`  | TIMESTAMPTZ | Data de exclusão (soft delete)                 |

### Tabela `points`

| Coluna       | Tipo        | Descrição                                   |
| ------------ | ----------- | ------------------------------------------- |
| `id`         | UUID        | Chave primária (auto-gerado)                |
| `map_id`     | UUID        | FK para maps (CASCADE DELETE)               |
| `name`       | TEXT        | Nome do ponto (obrigatório, único por mapa) |
| `location`   | POINT       | Coordenadas (longitude, latitude)           |
| `created_at` | TIMESTAMP   | Data de criação                             |
| `updated_at` | TIMESTAMP   | Data da última atualização                  |
| `deleted_at` | TIMESTAMPTZ | Data de exclusão (soft delete)              |

### Índices

- `idx_maps_name_unique_active` - Unicidade de nomes apenas entre mapas ativos
- `idx_maps_active` - Otimiza busca de registros não deletados
- `idx_points_map_name_unique_active` - Unicidade de nomes por mapa (ativos)
- `idx_points_map_id` - Otimiza busca de pontos por mapa
- `idx_points_map_id_active` - Índice composto para pontos ativos por mapa

---

## API

### Mapas

| Método   | Rota            | Descrição                    |
| -------- | --------------- | ---------------------------- |
| `GET`    | `/api/maps`     | Lista todos os mapas         |
| `POST`   | `/api/maps`     | Cria um novo mapa            |
| `GET`    | `/api/maps/:id` | Busca um mapa por ID         |
| `PUT`    | `/api/maps/:id` | Atualiza um mapa             |
| `DELETE` | `/api/maps/:id` | Exclui um mapa (soft delete) |

### Pontos

| Método   | Rota                            | Descrição               |
| -------- | ------------------------------- | ----------------------- |
| `GET`    | `/api/maps/:id/points`          | Lista pontos de um mapa |
| `POST`   | `/api/maps/:id/points`          | Cria um novo ponto      |
| `DELETE` | `/api/maps/:id/points`          | Exclui todos os pontos  |
| `GET`    | `/api/maps/:id/points/:pointId` | Busca um ponto por ID   |
| `PUT`    | `/api/maps/:id/points/:pointId` | Atualiza um ponto       |
| `DELETE` | `/api/maps/:id/points/:pointId` | Exclui um ponto         |

### Exemplos de Payload

**Criar mapa:**

```json
{
  "name": "Meu Mapa",
  "description": "Lugares favoritos"
}
```

**Criar ponto:**

```json
{
  "name": "Praça da Sé",
  "latitude": -23.5505,
  "longitude": -46.6333
}
```

### Status Codes

| Código | Significado               |
| ------ | ------------------------- |
| `200`  | OK                        |
| `201`  | Criado com sucesso        |
| `204`  | Sucesso (sem corpo)       |
| `400`  | Erro de validação         |
| `404`  | Não encontrado            |
| `409`  | Conflito (nome duplicado) |

---

## Como Rodar Localmente

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- npm ou yarn

### Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/meus-mapas.git
cd meus-mapas

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local

# 4. Inicie o banco de dados
npm run db:up

# 5. Execute as migrações
npm run migrations:migrate

# 6. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

---

## Variáveis de Ambiente

Copie `.env.example` para `.env.local` e configure:

| Variável       | Descrição                 | Exemplo                                          |
| -------------- | ------------------------- | ------------------------------------------------ |
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgres://user:pass@localhost:5432/meus_mapas` |

Para testes, use `.env.test` com um banco separado.

---

## Testes

```bash
# Rodar todos os testes
npm test

# Rodar testes uma vez (CI)
npm test -- --run

# Rodar testes de um arquivo específico
npm test -- --run "app/api/maps/route.test.ts"
```

### Cobertura

- API de Mapas (CRUD completo)
- API de Pontos (CRUD completo + exclusão em massa)
- Validações (Zod schemas)

### Observações

- Cada teste limpa o banco antes de executar (`beforeEach`)
- Testes rodam em sequência (não paralelos) para evitar conflitos
- Use `.env.test` para configurar banco de testes separado

---

## Comandos Úteis

### Desenvolvimento

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Inicia servidor de produção
```

### Lint e Formatação

```bash
npm run lint         # Verifica problemas de lint
npm run lint:fix     # Corrige problemas automaticamente
npm run format       # Formata todo o código
npm run format:check # Verifica formatação
```

### Banco de Dados

```bash
npm run db:up        # Inicia container PostgreSQL
npm run db:down      # Para o container (mantém dados)
npm run db:clean     # Para e remove dados (CUIDADO!)
npm run db:logs      # Mostra logs do container
```

### Migrações

```bash
npm run migrations:create <NOME>   # Cria nova migração
npm run migrations:migrate         # Executa migrações pendentes
```
