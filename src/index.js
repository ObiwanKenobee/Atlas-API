const express = require('express');
const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Import services
const didResolver = require('./services/didResolver');
const didAuth = require('./middleware/didAuth');
const VRCService = require('./services/vrcService');
const OracleService = require('./services/oracleService');
const RVEService = require('./services/rveService');

const specsDir = path.join(__dirname, '..', 'openapi');

function loadSpec(name) {
  try {
    return YAML.load(path.join(specsDir, `${name}.yaml`));
  } catch (e) {
    return null;
  }
}

const specs = {
  'rl-did': loadSpec('rl-did'),
  'didcomm': loadSpec('didcomm'),
  'vrc': loadSpec('vrc'),
  'oracle': loadSpec('oracle'),
  'rve': loadSpec('rve'),
  'governance': loadSpec('governance'),
  'commons': loadSpec('commons')
};

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Serve Swagger UI for each spec
Object.entries(specs).forEach(([k, spec]) => {
  if (spec) {
    app.use(`/specs/${k}`, swaggerUi.serve, swaggerUi.setup(spec));
  }
});

// RL-DID endpoints
app.post('/v1/rl-dids', (req, res) => {
  const did = `did:rl:${Date.now()}`;
  didResolver.register(did, { id: did, ...req.body });
  res.status(201).json({ did, document: { id: did } });
});

app.get('/v1/rl-dids/:did', (req, res) => {
  const doc = didResolver.resolve(req.params.did);
  res.json(doc || { id: req.params.did });
});

app.patch('/v1/rl-dids/:did/stewardship', didAuth, (req, res) => {
  res.json({ did: req.params.did, stewardship: req.body });
});

// VRC endpoints
app.post('/v1/vrc/issue', didAuth, (req, res) => {
  const cred = VRCService.issue(req.body);
  res.status(201).json(cred);
});

app.post('/v1/vrc/verify', (req, res) => {
  const result = VRCService.verify(req.body.credential);
  res.json(result);
});

app.get('/v1/vrc/:credentialId/status', (req, res) => {
  const status = VRCService.getStatus(req.params.credentialId);
  res.json(status || { error: 'not found' });
});

// Oracle endpoints
app.post('/v1/oracle/sensors', didAuth, (req, res) => {
  const sensorId = OracleService.registerSensor(req.body);
  res.status(201).json({ did: req.body.did, sensorId });
});

app.post('/v1/oracle/sensors/:sensorId/measurements', didAuth, (req, res) => {
  const measurementId = OracleService.submitMeasurement(req.params.sensorId, req.body);
  res.status(201).json({ measurementId });
});

app.post('/v1/oracle/aggregate', (req, res) => {
  const claim = OracleService.aggregate(req.body.query, req.body.policy);
  res.json(claim);
});

// RVE endpoints
app.post('/v1/rve/activations', didAuth, (req, res) => {
  const activation = RVEService.submit(req.body);
  res.status(201).json(activation);
});

app.get('/v1/rve/activations/:activationId', (req, res) => {
  const status = RVEService.getStatus(req.params.activationId);
  res.json(status || { error: 'not found' });
});

app.post('/v1/rve/verify-and-trigger', didAuth, (req, res) => {
  const result = RVEService.verifyAndTrigger(
    req.body.activationId,
    req.body.conditions,
    req.body.onSuccess
  );
  res.json(result);
});

// Commons endpoints
app.get('/v1/commons/metrics', (req, res) => {
  res.json({
    metric: req.query.metric,
    value: Math.random() * 100,
    confidence: 0.85,
    timestamp: new Date().toISOString()
  });
});

app.get('/v1/commons/audit-trail', (req, res) => {
  const events = RVEService.getAuditLog();
  res.json({ events, hasMore: false });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Atlas Sanctum reference API listening on http://localhost:${PORT}`);
  console.log('Available specs:');
  Object.keys(specs).forEach(k => console.log(` - http://localhost:${PORT}/specs/${k}`));
});
