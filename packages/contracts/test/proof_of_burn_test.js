const libsemaphore = require('libsemaphore')
const deploy = require('../scripts/deploy')
const ethers = require('ethers')

// Traditional Truffle test

describe('ProofOfBurn contract', () => {
  describe('register', () => {
    it('Should emit an event', async () => {
      const contracts = await deploy.deployContracts()
      const identity = libsemaphore.genIdentity()
      const identityCommitment = libsemaphore.genIdentityCommitment(identity)

      const tx = await contracts.ProofOfBurn.register(
        identityCommitment.toString(),
        {
          value: ethers.utils.parseEther('10')
        }
      )

      assert.equal(tx.logs[0].args._identityCommitment, identityCommitment)
    })
  })
})
