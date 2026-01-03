const crypto = require('crypto');

const activations = new Map();
const auditLog = [];

class RVEService {
  static submit(activationRequest) {
    const activationId = crypto.randomBytes(8).toString('hex');
    const activation = {
      activationId,
      subject: activationRequest.subject,
      credentialId: activationRequest.credentialId,
      claimId: activationRequest.claimId,
      requestedAction: activationRequest.requestedAction,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    activations.set(activationId, activation);
    return activation;
  }

  static verifyAndTrigger(activationId, conditions, onSuccess) {
    const activation = activations.get(activationId);
    if (!activation) throw new Error('activation not found');

    // Stub verification: conditions pass if credentialId and claimId are present
    const verified = activation.credentialId && activation.claimId;
    if (!verified) {
      activation.status = 'failed';
      auditLog.push({
        activationId,
        event: 'verification_failed',
        timestamp: new Date().toISOString()
      });
      return { verified: false, triggered: false, errors: ['Credential or claim not found'] };
    }

    activation.status = 'verified';
    const transactionId = crypto.randomBytes(8).toString('hex');
    activation.transactionId = transactionId;

    if (onSuccess?.smartContract) {
      activation.status = 'triggered';
      auditLog.push({
        activationId,
        event: 'triggered',
        transactionId,
        timestamp: new Date().toISOString(),
        action: onSuccess.smartContract
      });
    }

    return {
      activationId,
      verified: true,
      triggered: activation.status === 'triggered',
      transactionId
    };
  }

  static getStatus(activationId) {
    return activations.get(activationId) || null;
  }

  static cancel(activationId) {
    const activation = activations.get(activationId);
    if (!activation) throw new Error('not found');
    if (activation.status !== 'pending') {
      throw new Error('can only cancel pending activations');
    }
    activation.status = 'cancelled';
    auditLog.push({
      activationId,
      event: 'cancelled',
      timestamp: new Date().toISOString()
    });
  }

  static getAuditLog() {
    return auditLog;
  }
}

module.exports = RVEService;
