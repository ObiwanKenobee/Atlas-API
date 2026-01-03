/**
 * Atlas Sanctum Node.js SDK
 * Simple client library for interacting with the API
 */

const http = require('http');

class AtlasSanctumSDK {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  async request(method, path, body = null, didToken = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseURL + path);
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      if (didToken) {
        options.headers['Authorization'] = `Bearer ${didToken}`;
      }

      const req = http.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(data);
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  // RL-DID API
  async createDID(controller, metadata = {}) {
    return this.request('POST', '/v1/rl-dids', { controller, metadata });
  }

  async resolveDID(did) {
    return this.request('GET', `/v1/rl-dids/${did}`);
  }

  async attachStewardship(did, stewardship, didToken) {
    return this.request('PATCH', `/v1/rl-dids/${did}/stewardship`, stewardship, didToken);
  }

  // VRC API
  async issueCredential(issuer, subject, type, credentialSubject, didToken) {
    return this.request(
      'POST',
      '/v1/vrc/issue',
      { issuer, subject, type, credentialSubject },
      didToken
    );
  }

  async verifyCredential(credential) {
    return this.request('POST', '/v1/vrc/verify', { credential });
  }

  async getCredentialStatus(credentialId) {
    return this.request('GET', `/v1/vrc/${credentialId}/status`);
  }

  // Oracle API
  async registerSensor(owner, capabilities, didToken) {
    return this.request(
      'POST',
      '/v1/oracle/sensors',
      { did: `did:rl:sensor-${Date.now()}`, owner, capabilities },
      didToken
    );
  }

  async submitMeasurement(sensorId, timestamp, payload, signature, didToken) {
    return this.request(
      'POST',
      `/v1/oracle/sensors/${sensorId}/measurements`,
      { timestamp, payload, signature, schema: 'soil-moisture.v1' },
      didToken
    );
  }

  async aggregateMeasurements(query, policy) {
    return this.request('POST', '/v1/oracle/aggregate', { query, policy });
  }

  // RVE API
  async submitActivation(subject, credentialId, requestedAction, didToken) {
    return this.request(
      'POST',
      '/v1/rve/activations',
      { subject, credentialId, requestedAction },
      didToken
    );
  }

  async verifyAndTrigger(activationId, conditions, onSuccess, didToken) {
    return this.request(
      'POST',
      '/v1/rve/verify-and-trigger',
      { activationId, conditions, onSuccess },
      didToken
    );
  }

  async getActivationStatus(activationId) {
    return this.request('GET', `/v1/rve/activations/${activationId}`);
  }

  // Commons API
  async getMetrics(metric, bbox, timeRange) {
    const params = new URLSearchParams({ metric, bbox, timeRange });
    return this.request('GET', `/v1/commons/metrics?${params}`);
  }

  async getAuditTrail(since, limit = 50) {
    const params = new URLSearchParams({ since, limit });
    return this.request('GET', `/v1/commons/audit-trail?${params}`);
  }
}

module.exports = AtlasSanctumSDK;
