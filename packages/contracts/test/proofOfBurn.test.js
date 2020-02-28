const test = require('ava')
const libsemaphore = require('libsemaphore')
const deploy = require('../lib/deploy')
const ethers = require('ethers')
const { REGISTRATION_FEE } = require('../constants')

const registrationFee = REGISTRATION_FEE

const setup = async () => {
  const contracts = await deploy.deployContracts({
    registrationFee
  })
  const identity = libsemaphore.genIdentity()
  const identityCommitment = libsemaphore.genIdentityCommitment(identity)

  return { contracts, identityCommitment }
}

test('register should emit an event', async t => {
  t.timeout(25000)
  const { contracts, identityCommitment } = await setup()

  const tx = await contracts.ProofOfBurn.register(
    identityCommitment.toString(),
    {
      value: ethers.utils.parseEther(registrationFee.toString())
    }
  )
  const receipt = await tx.wait()
  const _identityCommitment = receipt.events.pop().args[0]
  t.is(_identityCommitment.toString(), identityCommitment.toString())
})

test('Should fail when not enough registration fee is sent', async t => {
  t.timeout(25000)
  const { contracts, identityCommitment } = await setup()
  const fee = registrationFee * 0.9
  try {
    await contracts.ProofOfBurn.register(identityCommitment.toString(), {
      value: ethers.utils.parseEther(fee.toString())
    })
  } catch (err) {
    t.true(err.message.includes('Not sending the right amount of ether'))
  }
})
