# Meus Mapas

Aplicação para criar e gerenciar Mapas e Pontos (latitude/longitude), lista de mapas, visualização de um mapa com pontos, adição de pontos clicando no mapa, edição do nome, exclusão de pontos e exclusão em massa.

## Sumário

- [Meus Mapas](#meus-mapas)
  - [Sumário](#sumário)
  - [Aquitetura do projeto](#aquitetura-do-projeto)
  - [Objetivo](#objetivo)
    - [Principais pontos:](#principais-pontos)
  - [Estrutura do repositório](#estrutura-do-repositório)
  - [Variáveis de ambiente](#variáveis-de-ambiente)
  - [Rodando localmente](#rodando-localmente)
  - [ESlint + Prettier](#eslint--prettier)
  - [Postgres Database](#postgres-database)

## Aquitetura do projeto

- **Frontend**: Next.js 16 (App Router) + React + TypeScript
- **Mapa**: Leaflet.js + OpenStreetMap
- **Backend**: Next.js API Routes (REST API)
- **Banco de Dados**: PostgreSQL
- **Migrations**:
- **Containerização**: Docker + Docker Compose
- **Deploy**:

## Objetivo

Construir uma aplicação simples e bem documentada que permita criar mapas e gerenciar pontos georreferenciados via frontend (Leaflet + OSM) e uma API REST (Next.js API Routes).

### Principais pontos:

- CRUD de mapas
- CRUD de pontos (associados a um mapa)
- Adicionar ponto clicando no mapa (Leaflet)
- Visualização de mapa com marcações (Leaflet + OpenStreetMap)
- Exclusão em massa de pontos de um mapa
- API REST simples consumida pelo frontend

## Estrutura do repositório

```bash
├─ app/
├─ public/
├─ migrations/
├─ app/
├─ public/
├─ Dockerfile
├─ docker-compose.yml
├─ package.json
├─ postcss.config.mjs
├─ tsconfig.json
└─ README.md
```

## Variáveis de ambiente

Crie um arquivo `.env.local` com pelo menos:

```env
DATABASE_URL=postgres://USERNAME:PASSWORD@HOST:5432/DATABASE
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Opcional (se usar Mapbox)
NEXT_PUBLIC_MAPBOX_TOKEN=
```

## Rodando localmente

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## ESlint + Prettier

```bash
# Verificar problemas de lint

npm run lint

# Corrigir problemas de lint automaticamente
npm run lint:fix

# Formatar todo o código
npm run format

# Verificar se o código está formatado
npm run format:check
```

## Postgres Database

```bash
# Inicia o container PostgreSQL em modo detached (`-d`)
npm run db:up

# Para e remove o container PostgreSQL. Os dados persistem no volume Docker
npm run db:down

# Para, remove o container **E remove o volume** (`-v`). CUIDADO: Apaga todos os dados do banco
npm run db:clean

# Mostra os logs do container em tempo real (`-f` = follow)
npm run db:logs
```
