const request = require('supertest')
const { createApp, bindDb } = require('../src/app')
const { deployContracts } = require('semaphore-auth-contracts/lib/deploy')
const {
  REGISTRATION_FEE,
  SEMAPHORE_TREE_DEPTH,
  CIRCUIT_CACHE_PATH,
  PROVING_KEY_CACHE_PATH,
  VERIFYING_KEY_PATH
} = require('semaphore-auth-contracts/constants')
const {
  EpochbasedExternalNullifier
} = require('semaphore-auth-contracts/lib/externalNullifier')
const fs = require('fs')
const libsemaphore = require('libsemaphore')
const ethers = require('ethers')
const test = require('ava')

const configs = require('../src/configs')

test('should post a new post', async t => {
  const app = createApp()
  await bindDb()

  const registrationFee = REGISTRATION_FEE
  const contracts = await deployContracts({ registrationFee })

  // Override the address
  configs.SEMAPHORE_ADDRESS = contracts.Semaphore.address

  const identity = libsemaphore.genIdentity()
  const identityCommitment = libsemaphore.genIdentityCommitment(identity)
  await contracts.ProofOfBurn.register(identityCommitment.toString(), {
    value: ethers.utils.parseEther(registrationFee.toString())
  })

  console.log('Registered identity')

  const cirDef = require(CIRCUIT_CACHE_PATH)

  const circuit = libsemaphore.genCircuit(cirDef)
  const leaves = await contracts.ProofOfBurn.getIdentityCommitments()

  t.is(leaves[0].toString(), identityCommitment.toString())

  const postBody = 'foooooo'
  const signalStr = ethers.utils.hashMessage(postBody)

  const newPostExternalNullifierGen = new EpochbasedExternalNullifier(
    '/posts/new',
    300 * 1000 // rate limit to 30 seconds
  )

  const externalNullifierStr = newPostExternalNullifierGen.getString()
  console.log(externalNullifierStr)
  const externalNullifier = libsemaphore.genExternalNullifier(
    externalNullifierStr
  )

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

  const root = libsemaphore.stringifyBigInts(publicSignals[0])
  t.true(await contracts.Semaphore.rootHistory(root))

  let postId
  await request(app)
    .post('/posts/new')
    .send({
      postBody,
      proof: stringfiedProof,
      publicSignals: stringfiedPublicSignals
    })
    .set('Accept', 'application/json')
    .expect(200)
    .then(res => {
      t.true(res.body.message.includes('Your article is published!'))
      postId = res.body.postId
    })

  await request(app)
    .get(`/posts/${postId}`)
    .expect(200)
    .then(res => t.is(res.body.postBody, postBody))
})
