# Atlas Sanctum Architecture & Implementation Guide

## System Overview

Atlas Sanctum is a **reference API framework** for regenerative systems identity, credentials, and value activation. This guide covers the main components and integration patterns.

### Core Services

1. **RL-DID API** (`src/services/didResolver.js`)
   - In-memory DID store with controller registration
   - Stewardship metadata attachment
   - Production: Replace with Postgres + did:key / did:web resolver

2. **VRC Service** (`src/services/vrcService.js`)
   - Credential issuance (signed with issuer DID)
   - Verification (signature, revocation, validity)
   - Revocation registry (in-memory; use CRL or revocation contracts in production)

3. **Oracle Service** (`src/services/oracleService.js`)
   - Sensor registration and trust scoring
   - Measurement submission with signatures
   - Aggregation (median, weighted) with provenance
   - Anomaly detection (stub)

4. **RVE Service** (`src/services/rveService.js`)
   - Activation submission and lifecycle
   - Atomic verify-and-trigger with credential checks
   - Audit logging for immutable event records

5. **DID-Auth Middleware** (`src/middleware/didAuth.js`)
   - Bearer token validation (expects DID as token)
   - Attaches `req.did` and `req.didDocument` to protected routes
   - Production: Use JWS with key material lookup, mTLS for high-assurance

### Persistence Layer

**Database Schema** (`db/schema.sql`)
- DIDs, credentials, sensors, measurements, claims, activations, audit events
- Merkle root tracking for audit ledger integrity
- Indexes for common queries (subject, status, timestamp)

**Migration**: Copy schema to Postgres (see Setup below)

### Authentication & Security

- **DID-Auth**: Bearer tokens signed by DID controllers
- **mTLS**: Optional for high-trust operators
- **Secrets Management**: Use env vars or HashiCorp Vault in production
- **Audit Trail**: Append-only event log with Merkle tree proofs

### Deployment

1. **Local Development**:
   ```bash
   npm install && npm start
   ```

2. **Docker**:
   ```bash
   docker-compose up
   ```

3. **Production** (recommended):
   - Add Postgres (see docker-compose.prod.yml template below)
   - Use environment variables for secrets
   - Enable HTTPS/TLS
   - Set up monitoring (Prometheus, ELK, Datadog)
   - Rate limiting and API gateway (Kong, nginx)
   - Key management service (AWS KMS, HashiCorp Vault)

### Integration Examples

**Issuing a Credential**:
```javascript
const vrc = await sdk.issueCredential(
  'did:example:issuer',
  'did:rl:land-123',
  ['VerifiableCredential', 'SoilHealthCredential'],
  { soilCarbon: 3.8, biodiversityIndex: 0.72 },
  issuerDID  // DID-auth token
);
```

**Aggregating Sensor Data**:
```javascript
const claim = await sdk.aggregateMeasurements(
  { metric: 'soilCarbon', bbox: [-74.3, 10.4, -74.1, 10.6] },
  { minTrustScore: 0.7 }  // Only trust sensors with score >= 0.7
);
```

**Triggering Value Activation**:
```javascript
const trigger = await sdk.verifyAndTrigger(
  activationId,
  [{ credentialId }, { claimId }],
  {
    smartContract: 'polygon://0x1234...incentive-pool',
    notarize: true  // Log to audit ledger
  },
  issuerDID
);
```

### Open Standards Alignment

- **W3C DID Core**: RL-DIDs conform to DID resolution spec
- **W3C VC Data Model**: VRCs are standard Verifiable Credentials
- **DIDComm v2**: Gateway supports identity.foundation spec
- **OpenAPI v3**: All APIs fully documented for interoperability

### Next Steps

1. **Database**: Migrate from in-memory stores to Postgres
2. **Crypto**: Integrate cryptographic libraries (tweetnacl, sodium, libsodium)
3. **Proofs**: Add Linked Data Proof and BBS+ signature support
4. **Webhooks**: Async event delivery for measurements and activations
5. **Observability**: Tracing (OpenTelemetry), metrics (Prometheus)
6. **Scaling**: Message queue (RabbitMQ, Kafka) for high-volume measurements
7. **Smart Contracts**: Adapters for Ethereum, Polygon, Solana RVE triggers
8. **Governance**: Policy engine (e.g., Rego/OPA) for machine-readable rules

### Reference Implementations

- **SDKs**: Node.js (complete), Python (stub), Go (planned)
- **CLI**: `atlas-cli` for key management, DID operations, VC workflows
- **Web UI**: Dashboard for credential management and audit views

### Support & Contributing

- Specs: https://github.com/atlas-sanctum/specs
- Issues: https://github.com/atlas-sanctum/atlas-api/issues
- Community: Regenerative Futures Consortium (regenerativefutures.org)
