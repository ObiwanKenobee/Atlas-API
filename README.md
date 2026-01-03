# Atlas Sanctum — Reference API Framework

This repository contains a minimal reference API framework for the Atlas Sanctum Open API Stack: identity (RL-DID), DIDComm gateway, Verifiable Regeneration Credentials (VRC), Sensor & Oracle Consensus, Regenerative Value Activation (RVE), Governance & Policy, and Commons Visualization APIs.

Quick start

Install dependencies:

```bash
cd "${PWD:-.}"
cd "./Atlas-API"
npm install
```

Run the server:

```bash
npm start
```

Open interactive API docs (Swagger UI):

- http://localhost:3000/specs/rl-did
- http://localhost:3000/specs/didcomm
- http://localhost:3000/specs/vrc
- http://localhost:3000/specs/oracle
- http://localhost:3000/specs/rve
- http://localhost:3000/specs/governance
- http://localhost:3000/specs/commons

Notes

- Specs are intentionally minimal stubs to bootstrap development. They follow OpenAPI v3 and should be expanded to match the full design.
- License: Apache-2.0 for code and specs; CC-BY for documentation.
