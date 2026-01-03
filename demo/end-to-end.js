/**
 * End-to-End Demo: Regenerative Land Certification Flow
 * 
 * This demo walks through the complete Atlas Sanctum workflow:
 * 1. Register a land DID
 * 2. Register sensors
 * 3. Submit measurements
 * 4. Aggregate sensor data
 * 5. Issue regeneration credential
 * 6. Trigger value activation (incentive payout)
 */

const AtlasSanctumSDK = require('../sdk/nodejs');

async function main() {
  const sdk = new AtlasSanctumSDK('http://localhost:3000');

  console.log('=== Atlas Sanctum End-to-End Demo ===\n');

  // Step 1: Register a land DID
  console.log('1. Creating land DID...');
  const landDID = 'did:rl:farmland:123456';
  const didResponse = await sdk.createDID(landDID, {
    location: { lat: 10.5, lon: -74.2 },
    landType: 'agricultural',
    size_hectares: 50
  });
  console.log(`   Land DID: ${landDID}\n`);

  // Step 2: Register sensors (soil moisture, carbon content)
  console.log('2. Registering sensors...');
  const sensorDIDs = [
    'did:rl:sensor:soil-moisture-001',
    'did:rl:sensor:soil-carbon-001'
  ];
  const sensorOwner = 'did:example:farmer-alice';

  for (const sensorDID of sensorDIDs) {
    await sdk.registerSensor(sensorOwner, ['soil-moisture', 'soil-carbon'], sensorOwner);
    console.log(`   Registered: ${sensorDID}`);
  }
  console.log();

  // Step 3: Submit measurements (simulate sensor data)
  console.log('3. Submitting sensor measurements...');
  const measurements = [
    { value: 25.5, unit: 'soilMoisture_percent' },
    { value: 3.8, unit: 'soilCarbon_percent' }
  ];

  for (let i = 0; i < sensorDIDs.length; i++) {
    const result = await sdk.submitMeasurement(
      sensorDIDs[i],
      new Date().toISOString(),
      measurements[i],
      'mock-signature-' + i,
      sensorOwner
    );
    console.log(`   Measurement from ${sensorDIDs[i]}: ${JSON.stringify(measurements[i])}`);
  }
  console.log();

  // Step 4: Aggregate sensor data into consensus claim
  console.log('4. Aggregating sensor data for consensus claim...');
  const aggregationResult = await sdk.aggregateMeasurements(
    { metric: 'soilCarbon', bbox: [-74.3, 10.4, -74.1, 10.6] },
    { minTrustScore: 0.7 }
  );
  console.log(`   Aggregated soil carbon: ${aggregationResult.aggregatedValue}%`);
  console.log(`   Confidence: ${aggregationResult.confidence}`);
  console.log(`   Claim ID: ${aggregationResult.claimId}\n`);

  // Step 5: Issue regeneration credential
  console.log('5. Issuing Verifiable Regeneration Credential...');
  const issuerDID = 'did:example:earth-trust-cert';
  const vrcResponse = await sdk.issueCredential(
    issuerDID,
    landDID,
    ['VerifiableCredential', 'RegenerativeAgriculturalCredential'],
    {
      soilCarbon: aggregationResult.aggregatedValue,
      biodiversityIndex: 0.72,
      waterQuality: 'good',
      certificationLevel: 'gold'
    },
    issuerDID
  );
  console.log(`   VRC ID: ${vrcResponse.id}`);
  console.log(`   Issuer: ${issuerDID}`);
  console.log(`   Subject (Land): ${landDID}`);
  console.log(`   Expiration: ${vrcResponse.expirationDate}\n`);

  // Step 6: Verify credential
  console.log('6. Verifying credential...');
  const verificationResult = await sdk.verifyCredential(vrcResponse);
  console.log(`   Valid: ${verificationResult.valid}`);
  console.log(`   Checks: ${verificationResult.checks.map(c => `${c.name}=${c.passed}`).join(', ')}\n`);

  // Step 7: Trigger value activation
  console.log('7. Triggering RVE activation (incentive payout)...');
  const credentialId = vrcResponse.id;
  const activationRequest = {
    subject: landDID,
    credentialId,
    claimId: aggregationResult.claimId,
    requestedAction: {
      type: 'incentive',
      amount: 500,
      currency: 'USDC',
      recipient: sensorOwner
    }
  };

  const activation = await sdk.submitActivation(
    activationRequest.subject,
    activationRequest.credentialId,
    activationRequest.requestedAction,
    issuerDID
  );
  console.log(`   Activation ID: ${activation.activationId}`);
  console.log(`   Status: ${activation.status}\n`);

  // Step 8: Verify and trigger payout
  console.log('8. Verifying and triggering smart contract...');
  const triggerResult = await sdk.verifyAndTrigger(
    activation.activationId,
    [
      { credentialId },
      { claimId: aggregationResult.claimId }
    ],
    {
      smartContract: 'polygon://0x1234...incentive-pool',
      notarize: true
    },
    issuerDID
  );
  console.log(`   Verification passed: ${triggerResult.verified}`);
  console.log(`   Triggered: ${triggerResult.triggered}`);
  if (triggerResult.transactionId) {
    console.log(`   Transaction ID: ${triggerResult.transactionId}\n`);
  }

  // Step 9: Query commons (public audit)
  console.log('9. Querying public commons (audit trail & metrics)...');
  const auditTrail = await sdk.getAuditTrail(new Date(Date.now() - 3600000).toISOString(), 10);
  console.log(`   Recent audit events: ${auditTrail.length}`);
  console.log();

  console.log('=== Demo Complete ===');
  console.log('Regenerative Land Certificate Workflow: SUCCESSFUL');
  console.log(`Land ${landDID} is now certified for carbon, biodiversity, and water stewardship.`);
}

main().catch(console.error);
