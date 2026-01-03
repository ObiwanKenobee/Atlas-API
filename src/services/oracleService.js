const crypto = require('crypto');

const sensors = new Map();
const measurements = new Map();
const claims = new Map();

class OracleService {
  static registerSensor(sensorData) {
    const sensorId = crypto.randomBytes(8).toString('hex');
    sensors.set(sensorId, {
      ...sensorData,
      trustScore: 0.8,
      measurements: []
    });
    return sensorId;
  }

  static submitMeasurement(sensorId, measurement) {
    const sensor = sensors.get(sensorId);
    if (!sensor) throw new Error('sensor not found');
    const measurementId = crypto.randomBytes(8).toString('hex');
    const record = {
      measurementId,
      sensorId,
      ...measurement,
      recordedAt: new Date().toISOString()
    };
    measurements.set(measurementId, record);
    sensor.measurements.push(measurementId);
    return measurementId;
  }

  static aggregate(query, policy) {
    // Simple aggregation: collect measurements matching query, compute median
    const relevantMeasurements = Array.from(measurements.values())
      .filter(m => {
        const sensor = sensors.get(m.sensorId);
        return sensor && sensor.trustScore >= (policy?.minTrustScore || 0);
      });

    if (relevantMeasurements.length === 0) {
      throw new Error('no measurements match query');
    }

    const values = relevantMeasurements
      .map(m => parseFloat(m.payload.value || m.payload.soilCarbon || 0))
      .sort((a, b) => a - b);

    const median = values[Math.floor(values.length / 2)];
    const confidence = Math.min(relevantMeasurements.length / 5, 1.0);

    const claimId = crypto.randomBytes(8).toString('hex');
    const claim = {
      claimId,
      metric: query.metric,
      aggregatedValue: median,
      confidence,
      sensorCount: relevantMeasurements.length,
      provenance: relevantMeasurements.map(m => ({
        sensorId: m.sensorId,
        measurement: m.payload.value || m.payload.soilCarbon,
        trustScore: sensors.get(m.sensorId).trustScore
      })),
      createdAt: new Date().toISOString()
    };
    claims.set(claimId, claim);
    return claim;
  }

  static getClaim(claimId) {
    return claims.get(claimId) || null;
  }
}

module.exports = OracleService;
