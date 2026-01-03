-- Atlas Sanctum PostgreSQL Schema
-- Supports: RL-DIDs, VRCs, Oracle measurements, RVE activations, audit ledger

CREATE TABLE IF NOT EXISTS dids (
  id SERIAL PRIMARY KEY,
  did VARCHAR(255) UNIQUE NOT NULL,
  method VARCHAR(50),
  controller VARCHAR(255),
  document JSONB,
  stewardship JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS credentials (
  id SERIAL PRIMARY KEY,
  credential_id VARCHAR(255) UNIQUE NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  type TEXT[] NOT NULL,
  credential_subject JSONB,
  issuance_date TIMESTAMP,
  expiration_date TIMESTAMP,
  proof JSONB,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_credentials_issuer ON credentials(issuer);
CREATE INDEX idx_credentials_subject ON credentials(subject);

CREATE TABLE IF NOT EXISTS sensors (
  id SERIAL PRIMARY KEY,
  sensor_id VARCHAR(255) UNIQUE NOT NULL,
  did VARCHAR(255),
  owner VARCHAR(255),
  capabilities TEXT[],
  location GEOMETRY,
  trust_score FLOAT DEFAULT 0.8,
  calibration_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS measurements (
  id SERIAL PRIMARY KEY,
  measurement_id VARCHAR(255) UNIQUE NOT NULL,
  sensor_id VARCHAR(255) NOT NULL REFERENCES sensors(sensor_id),
  timestamp TIMESTAMP NOT NULL,
  payload JSONB,
  signature VARCHAR(512),
  schema VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_measurements_sensor ON measurements(sensor_id);
CREATE INDEX idx_measurements_timestamp ON measurements(timestamp);

CREATE TABLE IF NOT EXISTS claims (
  id SERIAL PRIMARY KEY,
  claim_id VARCHAR(255) UNIQUE NOT NULL,
  metric VARCHAR(100),
  aggregated_value FLOAT,
  confidence FLOAT,
  sensor_count INT,
  provenance JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activations (
  id SERIAL PRIMARY KEY,
  activation_id VARCHAR(255) UNIQUE NOT NULL,
  subject VARCHAR(255),
  credential_id VARCHAR(255),
  claim_id VARCHAR(255),
  requested_action JSONB,
  status VARCHAR(50),
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activations_subject ON activations(subject);
CREATE INDEX idx_activations_status ON activations(status);

CREATE TABLE IF NOT EXISTS audit_events (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(255) UNIQUE NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  event_type VARCHAR(100),
  subject VARCHAR(255),
  action VARCHAR(255),
  details JSONB,
  merkle_hash VARCHAR(255),
  hash_index INT UNIQUE
);

CREATE INDEX idx_audit_timestamp ON audit_events(timestamp);

-- Merkle tree root tracking for audit ledger integrity
CREATE TABLE IF NOT EXISTS merkle_roots (
  id SERIAL PRIMARY KEY,
  root_hash VARCHAR(255) UNIQUE NOT NULL,
  tree_height INT,
  leaf_count INT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
