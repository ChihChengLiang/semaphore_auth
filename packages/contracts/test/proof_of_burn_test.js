const libsemaphore = require('libsemaphore')
const deploy = require('../scripts/deploy')
const ethers = require('ethers')
const configs = require('../configs')
const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers')

describe('ProofOfBurn contract', () => {
  let contracts
  beforeEach(async () => {
    contracts = await deploy.deployContracts(configs)
  })

  describe('register', () => {
    const identity = libsemaphore.genIdentity()
    const identityCommitment = libsemaphore.genIdentityCommitment(identity)

    it('Should emit an event', async () => {
      const receipt = await contracts.ProofOfBurn.register(
        identityCommitment.toString(),
        {
          value: ethers.utils.parseEther(configs.REGISTRATION_FEE.toString())
        }
      )
      expectEvent(receipt, 'Registered', {
        _identityCommitment: identityCommitment.toString()
      })
    })

    it('Should fail when not enough registration fee is sent', async () => {
      const fee = configs.REGISTRATION_FEE * 0.9
      await expectRevert(
        contracts.ProofOfBurn.register(identityCommitment.toString(), {
          value: ethers.utils.parseEther(fee.toString())
        }),
        'Not sending the right amount of ether'
      )
    })
  })
})
