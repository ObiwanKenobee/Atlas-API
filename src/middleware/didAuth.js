const didResolver = require('../services/didResolver');

// Lightweight DID-auth middleware (stub for development)
// Accepts `Authorization: Bearer <did>` where the token is a DID string.
// Verifies that resolver knows the DID and attaches `req.did`.

module.exports = function didAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const parts = h.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({ error: 'missing or invalid authorization header' });
  }
  const token = parts[1];
  // In this stub, token is the DID itself
  const doc = didResolver.resolve(token);
  if (!doc) return res.status(401).json({ error: 'unknown did' });
  req.did = token;
  req.didDocument = doc;
  next();
};
