const fs = require('fs')
const snarkjs = require('snarkjs')

const { VERIFYING_KEY_PATH } = require('semaphore-auth-contracts/constants')
const { semaphoreContract } = require('semaphore-auth-contracts/src/contracts')

const ethers = require('ethers')

const {
  genExternalNullifier,
  genSignalHash,
  stringifyBigInts,
  parseVerifyingKeyJson,
  verifyProof
} = require('libsemaphore')

const { SemaphoreLog } = require('./schema')
const configs = require('./configs')

function validateExternalNullifierMatch (actual, externalNullifierStr) {
  const expected = snarkjs.bigInt(genExternalNullifier(externalNullifierStr))
  if (expected !== actual) {
    throw Error(
      `Illegal externalNullifier: expect "${expected}" (${externalNullifierStr}), got "${actual}"`
    )
  }
}

function validateSignalHash (content, actual) {
  const signalStr = ethers.utils.hashMessage(content)
  const expected = genSignalHash(ethers.utils.toUtf8Bytes(signalStr))
  if (actual !== expected) {
    throw Error(`Expected signalHash ${expected}, got ${actual}`)
  }
}
async function validateNullifierNotSeen (nullifierHash) {
  const results = await SemaphoreLog.query()
    .select('nullifierHash', 'externalNullifierStr', 'id')
    .where('nullifierHash', nullifierHash.toString())
    .catch(console.error)

  if (results.length > 0) {
    const log = results[0]
    throw new Error(
      `nullifierHash (${nullifierHash}) has been seen before for the same external nullifier "${log.externalNullifierStr}"`
    )
  }
}
async function validateInRootHistory (root) {
  const provider = new ethers.providers.JsonRpcProvider()
  const semaphore = semaphoreContract(provider, configs.SEMAPHORE_ADDRESS)

  const isInRootHistory = await semaphore.rootHistory(
    stringifyBigInts(root)
  )
  if (!isInRootHistory) throw Error(`Root (${root.toString()}) not in history`)
}

async function validateProof (proof, publicSignals) {
  const verifyingKey = parseVerifyingKeyJson(
    fs.readFileSync(VERIFYING_KEY_PATH).toString()
  )
  const isValid = verifyProof(verifyingKey, proof, publicSignals)
  if (!isValid) throw Error('Invalid Proof')
}

module.exports = {
  validateExternalNullifierMatch,
  validateSignalHash,
  validateNullifierNotSeen,
  validateInRootHistory,
  validateProof
}
