const axios = require('axios');

const OPA_URL = process.env.OPA_URL || 'http://localhost:8181/v1/data/atlas/policy';

async function evaluate(input) {
  // input: JSON document for policy evaluation
  try {
    const res = await axios.post(OPA_URL, { input });
    // expected OPA format {result: <value>}
    return res.data.result;
  } catch (err) {
    console.error('OPA evaluation error', err.message || err);
    throw err;
  }
}

module.exports = { evaluate };
