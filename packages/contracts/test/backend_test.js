const request = require('supertest')
const app = require('../backend/app')
const deploy = require('../scripts/deploy')
const {
  REGISTRATION_FEE,
  SEMAPHORE_TREE_DEPTH,
  CIRCUIT_CACHE_PATH,
  PROVING_KEY_CACHE_PATH,
  VERIFYING_KEY_PATH
} = require('../constants')
const fs = require('fs')
const libsemaphore = require('libsemaphore')
const ethers = require('ethers')

describe('Backend', () => {
  let contracts
  const registrationFee = REGISTRATION_FEE

  beforeEach(async () => {
    contracts = await deploy.deployContracts({ registrationFee })
    app.set('ProofOfBurnAddress', contracts.ProofOfBurn.address)
    app.set('SemaphoreAddress', contracts.Semaphore.address)
  })

  describe('Post', () => {
    it('should post a new post', async () => {
      const identity = libsemaphore.genIdentity()
      const identityCommitment = libsemaphore.genIdentityCommitment(identity)
      await contracts.ProofOfBurn.register(identityCommitment.toString(), {
        value: ethers.utils.parseEther(registrationFee.toString())
      })

      const cirDef = require(CIRCUIT_CACHE_PATH)

      const circuit = libsemaphore.genCircuit(cirDef)
      const leaves = await contracts.ProofOfBurn.getLeaves()

      expect(leaves[0].toString()).equal(identityCommitment.toString())

      const signalStr = 'foooooo'

      const externalNullifier = libsemaphore.genExternalNullifier(
        'ANONlocalhost'
      )

      const { witness } = await libsemaphore.genWitness(
        signalStr,
        circuit,
        identity,
        leaves,
        SEMAPHORE_TREE_DEPTH,
        externalNullifier
      )
      expect(circuit.checkWitness(witness)).to.be.true

      const provingKey = fs.readFileSync(PROVING_KEY_CACHE_PATH)

      const proof = await libsemaphore.genProof(witness, provingKey)
      const publicSignals = libsemaphore.genPublicSignals(witness, circuit)

      const verifyingKey = libsemaphore.parseVerifyingKeyJson(
        fs.readFileSync(VERIFYING_KEY_PATH).toString()
      )

      expect(libsemaphore.verifyProof(verifyingKey, proof, publicSignals)).to.be
        .true

      const stringfiedProof = JSON.stringify(
        libsemaphore.stringifyBigInts(proof)
      )
      const stringfiedPublicSignals = JSON.stringify(
        libsemaphore.stringifyBigInts(publicSignals)
      )

      await request(app)
        .post('/post')
        .send({
          postBody: 'foooooo',
          proof: stringfiedProof,
          publicSignals: stringfiedPublicSignals
        })
        .set('Accept', 'application/json')
        .expect(200)
        .then(res => expect(res.text).equal('OK'))

      await request(app)
        .get('/')
        .expect(200)
        .then(res => expect(res.body.posts[0].postBody).equal('foooooo'))
    }).timeout(25000)
  })
})
