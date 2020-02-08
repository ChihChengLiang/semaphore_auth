const libsemaphore = require('libsemaphore')
const deploy = require('../scripts/deploy')
const ethers = require('ethers')
const configs = require('../configs')
const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
const fs = require('fs')

const cirDef = require('../semaphore/semaphorejs/build/circuit.json')

const provingKeyPath = '../semaphore/semaphorejs/build/proving_key.bin'
const verifyingKeyPath = '../semaphore/semaphorejs/build/verification_key.json'

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
      const signalHash = ethers.utils.solidityKeccak256(['string'], ['foo'])
      const externalNullifier = ethers.utils.solidityKeccak256(
        ['string'],
        [`ANON${configs.HOST_NAME}`]
      )
      const result = await libsemaphore.genWitness(
        signalHash,
        circuit,
        identity,
        leaves,
        configs.SEMAPHORE_TREE_DEPTH,
        externalNullifier
      )
      const witness = result.witness
      expect(circuit.checkWitness(witness)).toBeTruthy()
      const provingKey = fs.readFileSync(provingKeyPath)
      const proof = await libsemaphore.genProof(witness, provingKey)
      const publicSignals = libsemaphore.genPublicSignals(witness, circuit)
      const verifyingKey = libsemaphore.parseVerifyingKeyJson(
        fs.readFileSync(verifyingKeyPath).toString()
      )

      expect(
        libsemaphore.verifyProof(verifyingKey, proof, publicSignals)
      ).toBeTruthy()
      const registrationProof = libsemaphore.formatForVerifierContract(
        proof,
        publicSignals
      )
      const receipt = await contracts.ProofOfBurn.answerQuestion(
        signalHash,
        registrationProof.a,
        registrationProof.b,
        registrationProof.c,
        registrationProof.input
      )
      expectEvent(receipt, 'Login', {
        _publicHash: signalHash,
        _hostnameHash: externalNullifier
      })
    })
  })
})
