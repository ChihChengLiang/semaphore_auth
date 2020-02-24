const libsemaphore = require('libsemaphore')
const deploy = require('../scripts/deploy')
const ethers = require('ethers')
const { REGISTRATION_FEE } = require('../configs')
const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers')

describe('ProofOfBurn contract', () => {
  let contracts
  const registrationFee = REGISTRATION_FEE
  beforeEach(async () => {
    contracts = await deploy.deployContracts({
      registrationFee
    })
  })

  describe('register', () => {
    const identity = libsemaphore.genIdentity()
    const identityCommitment = libsemaphore.genIdentityCommitment(identity)

    it('Should emit an event', async () => {
      const receipt = await contracts.ProofOfBurn.register(
        identityCommitment.toString(),
        {
          value: ethers.utils.parseEther(registrationFee.toString())
        }
      )
      expectEvent(receipt, 'Registered', {
        _identityCommitment: identityCommitment.toString()
      })
    })

    it('Should fail when not enough registration fee is sent', async () => {
      const fee = registrationFee * 0.9
      await expectRevert(
        contracts.ProofOfBurn.register(identityCommitment.toString(), {
          value: ethers.utils.parseEther(fee.toString())
        }),
        'Not sending the right amount of ether'
      )
    })
  })
})
