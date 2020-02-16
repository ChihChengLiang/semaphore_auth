const request = require('supertest')
const app = require('../backend/app')
const deploy = require('../scripts/deploy')
const configs = require('../configs')
const fs = require('fs')
const path = require('path')
const libsemaphore = require('libsemaphore')
const ethers = require('ethers')

const cirDef = require('../semaphore/semaphorejs/build/circuit.json')

const provingKeyPath = path.join(
  __dirname,
  '../semaphore/semaphorejs/build/proving_key.bin'
)

const verifyingKeyPath = path.join(
  __dirname,
  '../semaphore/semaphorejs/build/verification_key.json'
)
describe('Backend', () => {
  let contracts

  beforeEach(async () => {
    contracts = await deploy.deployContracts(configs)
    app.set('ProofOfBurnAddress', contracts.ProofOfBurn.address)
    app.set('SemaphoreAddress', contracts.Semaphore.address)
  })

  describe('Post', () => {
    it('should post a new post', async () => {
      const identity = libsemaphore.genIdentity()
      const identityCommitment = libsemaphore.genIdentityCommitment(identity)
      await contracts.ProofOfBurn.register(identityCommitment.toString(), {
        value: ethers.utils.parseEther(configs.REGISTRATION_FEE.toString())
      })

      const circuit = libsemaphore.genCircuit(cirDef)
      const leaves = await contracts.ProofOfBurn.getLeaves()

      expect(leaves[0].toString()).equal(identityCommitment.toString())

      const signalStr = 'foooooo'

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
    })
  })
})
