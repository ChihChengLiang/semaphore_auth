const express = require('express')
const app = express()
const ethers = require('ethers')
const libsemaphore = require('libsemaphore')
const path = require('path')
const fs = require('fs')

const verifyingKeyPath = path.join(
  __dirname,
  '../semaphore/semaphorejs/build/verification_key.json'
)

function getContract () {
  const address = app.get('ProofOfBurnAddress')
  if (address === undefined) throw Error('Must configure ProofOfBurnAddress')
  const abi = require('./artifacts/ProofOfBurn.json').abi
  const provider = ethers.getDefaultProvider()
  return new ethers.Contract(address, abi, provider)
}

function validateProof (proof, publicSignals) {
  // hasNullifier
  // signal_hash == input[2]
  // hasExternalNullifier(input[3])
  // isInRootHistory(input[0])
  // verifyProof(a, b, c, input)
  const verifyingKey = libsemaphore.parseVerifyingKeyJson(
    fs.readFileSync(verifyingKeyPath).toString()
  )
  const isValid = libsemaphore.verifyProof(verifyingKey, proof, publicSignals)
  if (!isValid) throw Error('Invalid Proof')
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/login', (req, res) => {
  const parsedProof = libsemaphore.unstringifyBigInts(
    JSON.parse(req.body.proof)
  )
  const parsedPublicSignals = libsemaphore.unstringifyBigInts(
    JSON.parse(req.body.publicSignals)
  )
  validateProof(parsedProof, parsedPublicSignals)
  res.send({ login: 'OK' })
})

module.exports = app
