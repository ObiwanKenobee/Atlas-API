const crypto = require('crypto');

const store = new Map();

class VRCService {
  static issue(credentialRequest) {
    const credentialId = crypto.randomBytes(16).toString('hex');
    const credential = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      id: `did:vrc:${credentialId}`,
      type: credentialRequest.type,
      issuer: credentialRequest.issuer,
      subject: credentialRequest.subject,
      issuanceDate: new Date().toISOString(),
      expirationDate: credentialRequest.validUntil,
      credentialSubject: credentialRequest.credentialSubject,
      proof: { created: new Date().toISOString(), proofValue: 'stub-signature' }
    };
    store.set(credentialId, credential);
    return credential;
  }

  static verify(credential) {
    const checks = [
      { name: 'signature', passed: !!credential.proof },
      { name: 'revocation', passed: !store.get(`revoked_${credential.id}`) },
      { name: 'validity', passed: new Date(credential.expirationDate) > new Date() }
    ];
    return {
      valid: checks.every(c => c.passed),
      checks
    };
  }

  static revoke(credentialId) {
    store.set(`revoked_${credentialId}`, true);
  }

  static getStatus(credentialId) {
    const cred = store.get(credentialId);
    if (!cred) return null;
    const revoked = !!store.get(`revoked_${credentialId}`);
    return {
      credentialId,
      revoked,
      validFrom: cred.issuanceDate,
      validUntil: cred.expirationDate,
      isValid: !revoked && new Date(cred.expirationDate) > new Date()
    };
  }
}

module.exports = VRCService;
