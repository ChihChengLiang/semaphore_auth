if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

module.exports = {
  SERVER_NAME: process.env.SERVER_NAME || 'MyAwesomeForum',
  NETWORK: process.env.NETWORK || 'localhost',
  PROOF_OF_BURN_ADDRESS: process.env.PROOF_OF_BURN_ADDRESS,
  SEMAPHORE_ADDRESS: process.env.SEMAPHORE_ADDRESS
}
