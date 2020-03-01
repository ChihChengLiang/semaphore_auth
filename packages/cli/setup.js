const { CIRCUIT_PATH, PROVING_KEY_PATH } = require('./constants')
const {
  CIRCUIT_URL,
  PROVING_KEY_URL
} = require('semaphore-auth-contracts/constants')

const setupHandler = argv => {
  console.log('Setting up')
}

module.exports = { setupHandler }
