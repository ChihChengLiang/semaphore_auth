const path = require('path')

module.exports = {
  REGISTRATION_FEE: 0.009, // in ether
  MIMC_SEED: 'mimcsponge',

  // The circuits, proving key, verification key, and semaphore tree depth are interdependent
  SEMAPHORE_TREE_DEPTH: 20, // This number depends on the circuit we use.
  CIRCUIT_URL:
    'https://dl.dropboxusercontent.com/s/3gzxjibqgb6ke13/circuit.json?dl=1',
  CIRCUIT_CACHE_PATH: path.join(__dirname, './cache/circuit.json'),
  PROVING_KEY_URL:
    'https://dl.dropboxusercontent.com/s/qjlu6v125g7jkcq/proving_key.bin?dl=1',
  PROVING_KEY_CACHE_PATH: path.join(__dirname, './cache/proving_key.bin'),
}
