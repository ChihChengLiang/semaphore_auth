const config = require('@hojicha/config')

module.exports = {
  SERVER_NAME: config.backend.serverName || 'MyAwesomeForum',
  NETWORK: config.chain.network || 'localhost',
  PROOF_OF_BURN_ADDRESS: config.chain.contracts.proofOfBurn,
  SEMAPHORE_ADDRESS: config.chain.contracts.semaphore,
  db: config.backend.db
}
