const { EpochbasedExternalNullifier } = require('./src/externalNullifier')

const verificationKey = require('./assets/verification_key.json')
const SemaphoreABI = require('./abis/Semaphore.json')
const ProofOfBurnABI = require('./abis/ProofOfBurn.json')

const SEMAPHORE_TREE_DEPTH = 20

module.exports = {
  EpochbasedExternalNullifier,
  verificationKey,
  SemaphoreABI,
  ProofOfBurnABI,
  SEMAPHORE_TREE_DEPTH
}
