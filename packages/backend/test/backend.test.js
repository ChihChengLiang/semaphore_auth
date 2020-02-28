const request = require('supertest')
const app = require('../src/app')
const { deployContracts } = require('semaphore-auth-contracts/lib/deploy')
const {
  REGISTRATION_FEE,
  SEMAPHORE_TREE_DEPTH,
  CIRCUIT_CACHE_PATH,
  PROVING_KEY_CACHE_PATH,
  VERIFYING_KEY_PATH
} = require('semaphore-auth-contracts/constants')
const fs = require('fs')
const libsemaphore = require('libsemaphore')
const ethers = require('ethers')
const test = require('ava')

test('should post a new post', async t => {
  const registrationFee = REGISTRATION_FEE
  const contracts = await deployContracts({ registrationFee })
  app.set('ProofOfBurnAddress', contracts.ProofOfBurn.address)
  app.set('SemaphoreAddress', contracts.Semaphore.address)

  const identity = libsemaphore.genIdentity()
  const identityCommitment = libsemaphore.genIdentityCommitment(identity)
  await contracts.ProofOfBurn.register(identityCommitment.toString(), {
    value: ethers.utils.parseEther(registrationFee.toString())
  })

  console.log('Registered identity')

  const cirDef = require(CIRCUIT_CACHE_PATH)

  const circuit = libsemaphore.genCircuit(cirDef)
  const leaves = await contracts.ProofOfBurn.getLeaves()

  t.is(leaves[0].toString(), identityCommitment.toString())

  const signalStr = 'foooooo'

  const externalNullifier = libsemaphore.genExternalNullifier('ANONlocalhost')

  console.log('genWitness')

  const { witness } = await libsemaphore.genWitness(
    signalStr,
    circuit,
    identity,
    leaves,
    SEMAPHORE_TREE_DEPTH,
    externalNullifier
  )
  t.true(circuit.checkWitness(witness))

  const provingKey = fs.readFileSync(PROVING_KEY_CACHE_PATH)

  console.log('genProof and genPublicSignals')
  const proof = await libsemaphore.genProof(witness, provingKey)
  const publicSignals = libsemaphore.genPublicSignals(witness, circuit)

  const verifyingKey = libsemaphore.parseVerifyingKeyJson(
    fs.readFileSync(VERIFYING_KEY_PATH).toString()
  )

  t.true(libsemaphore.verifyProof(verifyingKey, proof, publicSignals))
  console.log('Requesting')

  const stringfiedProof = JSON.stringify(libsemaphore.stringifyBigInts(proof))
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
    .then(res => t.is(res.text, 'OK'))

  await request(app)
    .get('/')
    .expect(200)
    .then(res => t.is(res.body.posts[0].postBody, 'foooooo'))
})
