const { SignJWT } = require('jose');

let keyPairPromise = null;

async function getSigningKey() {
  if (process.env.JWK_PRIVATE) {
    // Expect a JSON JWK in env
    const jwk = JSON.parse(process.env.JWK_PRIVATE);
    return jwk;
  }
  if (!keyPairPromise) {
    // generate ephemeral ECDSA key pair for dev
    keyPairPromise = (async () => {
      const { generateKeyPair } = require('jose');
      const kp = await generateKeyPair('ES256');
      return kp.privateKey;
    })();
  }
  return keyPairPromise;
}

async function signPayload(payload, opts = {}) {
  const privateKey = await getSigningKey();
  const jwt = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'ES256' })
    .setIssuedAt()
    .setJti(opts.jti || undefined)
    .sign(privateKey);
  return jwt;
}

module.exports = { signPayload };
