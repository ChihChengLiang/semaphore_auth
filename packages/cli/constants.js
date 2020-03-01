const envPaths = require('env-paths')
const path = require('path')

const packageJson = require('./package.json')

const paths = envPaths(packageJson.name)

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

module.exports = {
  ROOT_DIR: paths.data,
  IDENTITIES_DIR: path.join(paths.data, 'identities/'),
  CIRCUIT_PATH: path.join(paths.data, 'circuit.json'),
  PROVING_KEY_PATH: path.join(paths.data, 'proving_key.bin'),
  PROOF_OF_BURN_ADDRESS: process.env.PROOF_OF_BURN_ADDRESS,
  SEMAPHORE_ADDRESS: process.env.SEMAPHORE_ADDRESS
}
