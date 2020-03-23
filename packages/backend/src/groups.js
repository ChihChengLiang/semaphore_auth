const { Router } = require('express')
const configs = require('./configs')

const groups = Router()

groups.get('/', (req, res) => {
  res.json({
    serverName: configs.SERVER_NAME,
    network: configs.NETWORK,
    registrationStyle: 'ProofOfBurn',
    registrationAddress: configs.PROOF_OF_BURN_ADDRESS,
    semaphoreAddress: configs.SEMAPHORE_ADDRESS
  })
})

module.exports = { groups }
