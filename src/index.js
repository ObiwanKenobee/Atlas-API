const express = require('express');
const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

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

// Minimal stub endpoints for each service
app.get('/v1/rl-dids/:did', (req, res) => {
  res.json({ did: req.params.did, document: { id: req.params.did } });
});

app.get('/v1/didcomm/health', (req, res) => res.json({ service: 'didcomm', status: 'ready' }));
app.post('/v1/didcomm/send', (req, res) => res.json({ accepted: true }));

app.post('/v1/vrc/issue', (req, res) => res.json({ issued: true, credential: req.body }));
app.post('/v1/vrc/verify', (req, res) => res.json({ valid: true }));

app.post('/v1/oracle/sensors', (req, res) => res.json({ registered: true, sensor: req.body }));
app.post('/v1/oracle/measurements', (req, res) => res.json({ received: true }));

app.post('/v1/rve/activations', (req, res) => res.json({ activationId: 'stub-activation', status: 'pending' }));

app.post('/v1/governance/policies', (req, res) => res.json({ published: true, policy: req.body }));

app.get('/v1/commons/metrics', (req, res) => res.json({ metrics: [], query: req.query }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Atlas Sanctum reference API listening on http://localhost:${PORT}`);
  console.log('Available specs:');
  Object.keys(specs).forEach(k => console.log(` - http://localhost:${PORT}/specs/${k}`));
});
