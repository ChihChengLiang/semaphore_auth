if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

module.exports = {
  PROOF_OF_BURN_ADDRESS: process.env.PROOF_OF_BURN_ADDRESS,
  SEMAPHORE_ADDRESS: process.env.SEMAPHORE_ADDRESS
}
