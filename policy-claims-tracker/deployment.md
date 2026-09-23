# Deployment Hardening Guide

This document captures the Phase 3 Assignment 3 deployment hardening updates.

## What was hardened

- Added `.dockerignore` files for both API and client build contexts.
- Updated both Dockerfiles to run as non-root users.
- Added Docker `HEALTHCHECK` instructions for API and client images.
- Added Docker Compose service healthchecks for Mongo, API, and client.
- Updated Compose startup sequencing to wait for healthy dependencies.
- Added Kubernetes resource requests/limits across API, client, and Mongo deployments.
- Added Kubernetes probes for client and Mongo deployments.
- Exposed API service with NodePort (`30400`) and client with NodePort (`30080`).

## Dev deployment (compose)

```bash
cd /home/labadmin/Projects/phase\ 3\ capstone/policy-claims-tracker
MONGO_HOST_PORT=27018 docker compose -f docker-compose.yml up --build -d
```

Health verification:

```bash
docker compose -f docker-compose.yml ps
curl -sS http://localhost:4000/api/health
curl -sS http://localhost:3000/
```

## Prod-style deployment (compose + TLS)

```bash
cd /home/labadmin/Projects/phase\ 3\ capstone/policy-claims-tracker
./generate-certs.sh
docker compose -f docker-compose.prod.yml up --build -d
```

Endpoints:

- `http://localhost:8080` (redirect)
- `https://localhost:8443`

## Kubernetes deployment

```bash
cd /home/labadmin/Projects/phase\ 3\ capstone/policy-claims-tracker
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
```

NodePort endpoints:

- Client: `http://localhost:30080`
- API: `http://localhost:30400/api/health`

## Notes

- API readiness/liveness endpoint: `/api/health`
- Client health endpoint: `/`
- Mongo readiness/liveness: `db.adminCommand('ping').ok`
