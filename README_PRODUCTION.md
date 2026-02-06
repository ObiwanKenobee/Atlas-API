Production deployment notes
=========================

This document describes how to deploy Atlas Sanctum API to Kubernetes and set up CI/CD.

Prerequisites
- Docker registry credentials (set CI secrets `REGISTRY`, `REGISTRY_USERNAME`, `REGISTRY_PASSWORD`)
- Kubernetes cluster with `kubectl` access (set `KUBECONFIG` in CI or use GitOps)
- Optional: ArgoCD installed for GitOps

Quick deploy (local cluster using kind/minikube)

1. Build and push image (or load into local cluster):

```bash
IMAGE_NAME=your-registry/atlas-sanctum-api:latest
docker build -t $IMAGE_NAME .
docker push $IMAGE_NAME
```

2. Create secrets (example):

```bash
kubectl create secret generic atlas-secrets --from-literal=DATABASE_URL="postgres://atlas:password@postgres:5432/atlas"
```

3. Apply manifests:

```bash
kubectl apply -f k8s/
```

4. Run DB migration:

```bash
kubectl exec deploy/atlas-api -- npm run migrate-db
```

Notes
- CI uses `.github/workflows/ci.yml` and `.github/workflows/deploy.yml`. Set secrets for registry and KUBECONFIG in repository settings.
- Policies live in `policies/` and are intended to be loaded into an OPA sidecar or separate OPA service.
