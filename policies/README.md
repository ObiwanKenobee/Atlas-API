This folder contains example OPA/Rego policies used by the governance service.

Files:
- `allow_activation.rego` — example policy that permits activations for stewards or when credentials include `eligible: true`.

To run locally for testing:

```bash
docker run --rm -p 8181:8181 -v "$PWD":/policies openpolicyagent/opa:latest run --server /policies
```

Then POST to `http://localhost:8181/v1/data/atlas/policy` with `{"input": {...}}`.
