const express = require('express');
const didAuth = require('./middleware/didAuth');
const didResolver = require('./services/didResolver');

const app = express();
app.use(express.json());

// Internal helper to register DIDs for tests or bootstrap
app.post('/internal/register-did', (req, res) => {
  const { did, document } = req.body;
  try {
    didResolver.register(did, document);
    res.json({ registered: true, did });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Protected example route
app.get('/protected', didAuth, (req, res) => {
  res.json({ ok: true, did: req.did });
});

module.exports = app;
