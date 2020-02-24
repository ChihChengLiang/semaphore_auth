const path = require('path')

module.exports = {
  REGISTRATION_FEE: 0.009, // in ether
  MIMC_SEED: 'mimcsponge',

  // The circuits, proving key, verification key, and semaphore tree depth are interdependent
  SEMAPHORE_TREE_DEPTH: 12, // This number depends on the circuit we use.
  CIRCUIT_URL: 'https://oneofus.blob.core.windows.net/snarks/circuit.json',
  CIRCUIT_CACHE_PATH: path.join(__dirname, './cache/circuit.json'),
  PROVING_KEY_URL:
    'https://oneofus.blob.core.windows.net/snarks/proving_key.bin',
  PROVING_KEY_CACHE_PATH: path.join(__dirname, './cache/proving_key.bin'),
  // verification_key.json is downloaded from
  // https://oneofus.blob.core.windows.net/snarks/verification_key.json
  VERIFYING_KEY_PATH: path.join(__dirname, './assets/verification_key.json')
}
