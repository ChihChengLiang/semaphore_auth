const fs = require('fs')
const snarkjs = require('snarkjs')

const { VERIFYING_KEY_PATH } = require('semaphore-auth-contracts/constants')
const { semaphoreContract } = require('semaphore-auth-contracts/src/contracts')

const ethers = require('ethers')

const {
  genExternalNullifier,
  keccak256HexToBigInt,
  stringifyBigInts,
  parseVerifyingKeyJson,
  verifyProof
} = require('libsemaphore')

const { Post } = require('./schema')

function validateExternalNullifierMatch (actual, externalNullifierStr) {
  const expected = snarkjs.bigInt(genExternalNullifier(externalNullifierStr))
  if (expected !== actual) {
    throw Error(
      `Illegal externalNullifier: expect "${expected}" (${externalNullifierStr}), got "${actual}"`
    )
  }
}

function validateSignalHash (postBody, actual) {
  const signalStr = ethers.utils.hashMessage(postBody)
  const expected = keccak256HexToBigInt(
    ethers.utils.hexlify(ethers.utils.toUtf8Bytes(signalStr))
  )
  if (actual !== expected) {
    throw Error(`Expected signalHash ${expected}, got ${actual}`)
  }
}
async function validateNullifierNotSeen (nullifierHash) {
  const results = await Post.query()
    .select('nullifierHash', 'externalNullifierStr', 'id')
    .where('nullifierHash', nullifierHash.toString())
    .catch(console.error)

  if (results.length > 0) {
    const post = results[0]
    throw new Error(
      `Spam post: nullifierHash (${nullifierHash}) has been seen before for the same external nullifier "${post.externalNullifierStr}" in post id ${post.id}`
    )
  }
}
async function validateInRootHistory (root) {
  const provider = new ethers.providers.JsonRpcProvider()
  const semaphore = semaphoreContract(provider, configs.SEMAPHORE_ADDRESS)

  const isInRootHistory = await semaphore.isInRootHistory(
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
