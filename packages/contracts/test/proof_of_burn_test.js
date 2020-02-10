const libsemaphore = require('libsemaphore')
const deploy = require('../scripts/deploy')
const ethers = require('ethers')
const configs = require('../configs')
const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
const fs = require('fs')
const snarkjs = require('snarkjs')
const path = require('path')

const cirDef = require('../semaphore/semaphorejs/build/circuit.json')

const provingKeyPath = path.join(
  __dirname,
  '../semaphore/semaphorejs/build/proving_key.bin'
)
const verifyingKeyPath = path.join(
  __dirname,
  '../semaphore/semaphorejs/build/verification_key.json'
)

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
  describe('login', () => {
    it('Should login a user', async () => {
      const identity = libsemaphore.genIdentity()
      const identityCommitment = libsemaphore.genIdentityCommitment(identity)
      await contracts.ProofOfBurn.register(identityCommitment.toString(), {
        value: ethers.utils.parseEther(configs.REGISTRATION_FEE.toString())
      })

      const circuit = libsemaphore.genCircuit(cirDef)
      const leaves = await contracts.ProofOfBurn.getLeaves()

      expect(leaves[0].toString()).equal(identityCommitment.toString())

      const signalStr = 'foooooo'
      const signalToContract = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(signalStr)
      )

      const externalNullifier = libsemaphore.genExternalNullifier(
        `ANON${configs.HOST_NAME}`
      )
      expect(await contracts.Semaphore.hasExternalNullifier(externalNullifier))
        .to.be.true

      const result = await libsemaphore.genWitness(
        signalStr,
        circuit,
        identity,
        leaves,
        configs.SEMAPHORE_TREE_DEPTH,
        externalNullifier
      )
      const witness = result.witness
      expect(circuit.checkWitness(witness)).to.be.true
      const provingKey = fs.readFileSync(provingKeyPath)
      const proof = await libsemaphore.genProof(witness, provingKey)
      const publicSignals = libsemaphore.genPublicSignals(witness, circuit)

      const verifyingKey = libsemaphore.parseVerifyingKeyJson(
        fs.readFileSync(verifyingKeyPath).toString()
      )

      expect(libsemaphore.verifyProof(verifyingKey, proof, publicSignals)).to.be
        .true
      const registrationProof = libsemaphore.formatForVerifierContract(
        proof,
        publicSignals
      )
      const receipt = await contracts.ProofOfBurn.login(
        signalToContract,
        registrationProof.a,
        registrationProof.b,
        registrationProof.c,
        registrationProof.input
      )
      expectEvent(receipt, 'Login', {
        _publicHash: signalToContract,
        _hostnameHash: externalNullifier
      })
    })
  })
})
