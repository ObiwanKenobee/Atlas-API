# Atlas Sanctum — Open API Stack for Regenerative Systems

Reference implementation of the Atlas Sanctum API framework: identity, credentials, sensors, oracles, value activation, governance, and commons visibility for regenerative land systems.

## Quick Start

**Install and run locally:**

```bash
npm install
npm start
```

Server listens on `http://localhost:3000`.

**Run tests:**

```bash
npm test
```

**Try the interactive API docs (Swagger UI):**

- http://localhost:3000/specs/rl-did — Regenerative Land DIDs
- http://localhost:3000/specs/didcomm — Agent messaging
- http://localhost:3000/specs/vrc — Verifiable Credentials
- http://localhost:3000/specs/oracle — Sensor consensus
- http://localhost:3000/specs/rve — Value activation
- http://localhost:3000/specs/governance — Policy & governance
- http://localhost:3000/specs/commons — Public analytics

**Run Docker:**

```bash
docker-compose up
```

## Core APIs

### 1. RL-DID API (Regenerative Land Identity)
Register DIDs for land, attach stewardship metadata, resolve documents. Follows W3C DID Core standard.

```javascript
const sdk = require('atlas-sanctum-sdk');
const client = new sdk('http://localhost:3000');

const did = await client.createDID('did:example:farmer', {
  location: { lat: 10.5, lon: -74.2 },
  landType: 'agricultural'
});
```

### 2. VRC API (Verifiable Regeneration Credentials)
Issue, verify, and revoke signed credentials (soil, biodiversity, water, health). W3C VC Data Model.

```javascript
const vrc = await client.issueCredential(
  'did:example:issuer',
  'did:rl:land-123',
  ['VerifiableCredential', 'SoilHealthCredential'],
  { soilCarbon: 3.8, biodiversityIndex: 0.72 },
  issuerDID
);
```

### 3. Oracle Consensus API
Register sensors, submit signed measurements, aggregate with confidence scoring. No single sensor = truth.

```javascript
const claim = await client.aggregateMeasurements(
  { metric: 'soilCarbon', bbox: [-74.3, 10.4, -74.1, 10.6] },
  { minTrustScore: 0.7 }
);
```

### 4. RVE API (Regenerative Value Activation)
Trigger conditional value flows (payouts, insurance relief) when credentials verified.

```javascript
const trigger = await client.verifyAndTrigger(
  activationId,
  [{ credentialId }, { claimId }],
  { smartContract: 'polygon://0x1234...', notarize: true },
  issuerDID
);
```

### 5. Governance & Policy API
Publish machine-readable policies, issue state-backed credentials, participate in DAO voting.

### 6. DIDComm Gateway
Agent-to-agent messaging with credential requests/presentations, contract negotiation.

### 7. Commons Visualization
Read-only, privacy-preserving query APIs: aggregated metrics, time-series, ecosystem health index, public audit trails.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for:
- Service descriptions
- Database schema (Postgres)
- Authentication & security patterns
- Deployment guide
- Integration examples
- Open standards alignment
- Roadmap

## Project Structure

```
.
├── src/
│   ├── index.js                 # Main Express app
│   ├── app.js                   # App wrapper (for testing)
│   ├── middleware/
│   │   └── didAuth.js           # DID-auth middleware
│   └── services/
│       ├── didResolver.js       # DID registry (in-memory)
│       ├── vrcService.js        # Credential issuance/verification
│       ├── oracleService.js     # Sensor aggregation
│       └── rveService.js        # Value activation
├── openapi/                     # OpenAPI v3 specifications
│   ├── rl-did.yaml
│   ├── didcomm.yaml
│   ├── vrc.yaml
│   ├── oracle.yaml
│   ├── rve.yaml
│   ├── governance.yaml
│   └── commons.yaml
├── sdk/
│   └── nodejs/index.js          # Node.js SDK
├── demo/
│   └── end-to-end.js            # Complete workflow demo
├── db/
│   └── schema.sql               # Postgres schema
├── tests/
│   └── didAuth.test.js          # Jest tests
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Demo & Examples

Run the end-to-end demo:

```bash
# Ensure server is running: npm start
node demo/end-to-end.js
```

This walks through:
1. Creating a land DID
2. Registering sensors
3. Submitting measurements
4. Aggregating data into a consensus claim
5. Issuing a regeneration credential
6. Verifying the credential
7. Triggering a value activation (incentive payout)
8. Querying public audit trails

## Development

**Install devDependencies:**

```bash
npm install
```

**Run tests:**

```bash
npm test
```

**Run in watch mode:**

```bash
npm run dev
```

**Lint/format:**

(Configure ESLint + Prettier as desired)

## Security & Privacy

- **DID-Auth**: Bearer tokens signed by DID controllers
- **No raw sensor feeds** exposed; only aggregated claims published
- **Privacy**: Differential privacy and redaction on commons queries
- **Audit**: Immutable append-only event ledger with Merkle proofs
- **Constraint enforcement**: Agents cannot act outside encoded ethical boundaries

## Open Standards

- **W3C DID Core**: RL-DIDs and DID resolution
- **W3C VC Data Model**: Verifiable Credentials
- **DIDComm v2**: Agent messaging (identity.foundation spec)
- **OpenAPI v3**: Full API documentation

## License

- **Code**: Apache 2.0
- **Documentation**: CC-BY
- **Specifications**: Apache 2.0 (permissive for implementation)

## Contributing

Contributions welcome! Please:
- Follow Apache 2.0 license
- Align with W3C standards
- Add tests for new features
- Document APIs in OpenAPI format

## Support

- **Issues**: https://github.com/atlas-sanctum/atlas-api/issues
- **Specs**: https://github.com/atlas-sanctum/specs
- **Community**: Regenerative Futures Consortium

---

**Atlas Sanctum**: Where identity becomes infrastructure. Open. Verified. Regenerative.

