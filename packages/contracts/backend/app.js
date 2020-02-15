const express = require('express')
const app = express()
const ethers = require('ethers')
const libsemaphore = require('libsemaphore')
const path = require('path')
const fs = require('fs')
const snarkjs = require('snarkjs')

const verifyingKeyPath = path.join(
  __dirname,
  '../semaphore/semaphorejs/build/verification_key.json'
)

function getContracts () {
  const proofOfBurnAddress = app.get('ProofOfBurnAddress')
  if (proofOfBurnAddress === undefined)
    throw Error('Must configure ProofOfBurnAddress')
  const semaphoreAddress = app.get('SemaphoreAddress')
  if (semaphoreAddress === undefined)
    throw Error('Must configure SemaphoreAddress')
  const proofOfBurnAbi = require('../artifacts/ProofOfBurn.json').abi
  const semaphoreAbi = require('../artifacts/Semaphore.json').abi
  const provider = new ethers.providers.JsonRpcProvider()
  const proofOfBurnContract = new ethers.Contract(
    proofOfBurnAddress,
    proofOfBurnAbi,
    provider
  )
  const semaphoreContract = new ethers.Contract(
    semaphoreAddress,
    semaphoreAbi,
    provider
  )
  return {
    ProofOfBurn: proofOfBurnContract,
    Semaphore: semaphoreContract
  }
}

async function validateProof (proof, publicSignals) {
  const [root, nullifierHash, signalHash, externalNullifier] = publicSignals
  const contracts = getContracts()
  // hasNullifier

  // hasExternalNullifier(input[3])
  const legitExternalNullifier = snarkjs.bigInt(
    libsemaphore.genExternalNullifier('ANONlocalhost')
  )
  if (legitExternalNullifier !== externalNullifier) {
    throw Error(
      `Illegal externalNullifier: expect ${legitExternalNullifier}, got ${externalNullifier}`
    )
  }

  // isInRootHistory(input[0])
  const isInRootHistory = await contracts.Semaphore.isInRootHistory(root.toString())
  if (!isInRootHistory) throw Error('Root not in history')

  // verifyProof(a, b, c, input)
  const verifyingKey = libsemaphore.parseVerifyingKeyJson(
    fs.readFileSync(verifyingKeyPath).toString()
  )
  const isValid = libsemaphore.verifyProof(verifyingKey, proof, publicSignals)
  if (!isValid) throw Error('Invalid Proof')

  // Record the post and the proof
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/login', async (req, res) => {
  const parsedProof = libsemaphore.unstringifyBigInts(
    JSON.parse(req.body.proof)
  )
  const parsedPublicSignals = libsemaphore.unstringifyBigInts(
    JSON.parse(req.body.publicSignals)
  )
  await validateProof(parsedProof, parsedPublicSignals)
  res.send({ login: 'OK' })
})

module.exports = app
