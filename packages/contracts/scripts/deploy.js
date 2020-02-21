const bre = require('@nomiclabs/buidler')
const ethers = require('ethers')
const configs = require('../configs')
const mimcGenContract = require('circomlib/src/mimcsponge_gencontract.js')
const libsemaphore = require('libsemaphore')

const MIMC_SEED = 'mimcsponge'

function buildMimcBytecode () {
  return mimcGenContract.createCode(MIMC_SEED, 220)
}

async function deployContracts ({
  compile = false,
  verbose = false
} = {}) {
  if (compile) {
    await bre.run('compile')
  }

  const MiMC = bre.artifacts.require('MiMC')
  const Semaphore = bre.artifacts.require('Semaphore')
  const ProofOfBurn = bre.artifacts.require('ProofOfBurn')

  MiMC.bytecode = buildMimcBytecode()

  const mimcInstance = await MiMC.new()
  await Semaphore.link(mimcInstance)

  const firstExternalNullifier = libsemaphore.genExternalNullifier(
    `ANON${configs.HOST_NAME}`
  )
  const semaphoreInstance = await Semaphore.new(
    configs.SEMAPHORE_TREE_DEPTH,
    0,
    firstExternalNullifier
  )

  const proofOfBurnInstance = await ProofOfBurn.new(
    semaphoreInstance.address,
    ethers.utils.parseEther(configs.REGISTRATION_FEE.toString())
  )

  await semaphoreInstance.transferOwnership(proofOfBurnInstance.address)

  if (verbose) {
    console.log('MiMC address', mimcInstance.address)
    console.log(`export SEMAPHORE_ADDRESS=${semaphoreInstance.address}`)
    console.log(`export PROOF_OF_BURN_ADDRESS=${proofOfBurnInstance.address}`)
  }

  return {
    MiMC: mimcInstance,
    Semaphore: semaphoreInstance,
    ProofOfBurn: proofOfBurnInstance
  }
}

async function main () {
  const verbose = process.argv.includes('--verbose')
  await deployContracts({ verbose })
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = {
  deployContracts
}
