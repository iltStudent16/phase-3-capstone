# Policy Claims Tracker

Policy Claims Tracker is a full-stack capstone application for managing insurance policies and claims. It includes JWT-authenticated users, policy and claim CRUD, dashboard analytics, containerized deployment, and Kubernetes manifests for local cluster deployment with Kind.

## Architecture Overview

- `capstone-api/`: Express + TypeScript + Mongoose REST API
- `capstone-client/`: React + TypeScript + Vite client served by Nginx
- `k8s/`: Kind cluster config + Kubernetes manifests
- `docker-compose.yml`: development stack
- `docker-compose.prod.yml`: production-style stack with SSL termination
- `generate-certs.sh`: self-signed certificate generation for local HTTPS

## Tech Stack

- Backend: Node.js, Express, TypeScript, Mongoose, MongoDB, JWT, bcryptjs, express-validator
- Frontend: React, TypeScript, Vite, Axios, React Router
- Testing: Vitest, Supertest, React Testing Library, MongoMemoryServer
- DevOps: Docker, Docker Compose, Nginx, Kind, Kubernetes

## Local Development (without Docker)

### API

1. Create env file:
   - `cp capstone-api/.env.example capstone-api/.env`
2. Ensure MongoDB is running and matches `MONGODB_URI`.
3. Install and run:
   - `cd capstone-api`
   - `npm install`
   - `npm run seed`
   - `npm run dev`

API runs on `http://localhost:4000`.

### Client

1. Install and run:
   - `cd capstone-client`
   - `npm install`
   - `npm run dev`

Client runs on `http://localhost:5173` and proxies `/api` to `http://localhost:4000`.

## Docker Compose Quick Start (Dev)

```bash
cd policy-claims-tracker
docker compose up --build -d
docker exec pct-api node dist/seed.js
```

If local port `27017` is already in use on your machine, run:

```bash
MONGO_HOST_PORT=27018 docker compose up --build -d
```

Open `http://localhost:3000`.

To stop:

```bash
docker compose down
```

## Production-style SSL (Compose)

Generate certs:

```bash
./generate-certs.sh
```

Start stack:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

- HTTP redirect endpoint: `http://localhost:8080`
- HTTPS app endpoint: `https://localhost:8443` (self-signed warning expected)

Stop:

```bash
docker compose -f docker-compose.prod.yml down
```

## Kubernetes Deployment (Kind)

```bash
kind create cluster --config k8s/kind-config.yaml --name policy-claims
docker build -t capstone-api:latest ./capstone-api
docker build -t capstone-client:latest ./capstone-client
kind load docker-image capstone-api:latest --name policy-claims
kind load docker-image capstone-client:latest --name policy-claims
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/mongo.yaml
kubectl apply -f k8s/api.yaml
kubectl apply -f k8s/client.yaml
kubectl -n policy-claims get pods,svc
```

App endpoint: `http://localhost:30080`

Seed data in-cluster:

```bash
kubectl -n policy-claims exec deployment/api -- node dist/seed.js
```

## API Endpoint Reference

| Area | Method | Endpoint | Description |
|---|---|---|---|
| Health | GET | `/api/health` | Health check |
| Auth | POST | `/api/auth/register` | Register user |
| Auth | POST | `/api/auth/login` | Login and receive JWT |
| Auth | GET | `/api/auth/me` | Current authenticated user |
| Policies | GET | `/api/policies` | List policies (filters/search/pagination) |
| Policies | POST | `/api/policies` | Create policy |
| Policies | GET | `/api/policies/:id` | Get single policy |
| Policies | PUT | `/api/policies/:id` | Update policy |
| Policies | DELETE | `/api/policies/:id` | Delete policy |
| Claims | GET | `/api/claims` | List claims (filters/search/pagination) |
| Claims | POST | `/api/claims` | Create claim |
| Claims | GET | `/api/claims/:id` | Get single claim |
| Claims | PUT | `/api/claims/:id` | Update claim |
| Claims | DELETE | `/api/claims/:id` | Delete claim |
| Claims | POST | `/api/claims/:id/notes` | Add claim note |
| Claims | GET | `/api/claims/stats` | Claim stats aggregation |
| Dashboard | GET | `/api/dashboard` | Summary stats + recent claims |

## Test Commands

### Backend tests

```bash
cd capstone-api
npm run test
```

### Frontend tests

```bash
cd capstone-client
npm run test
```
