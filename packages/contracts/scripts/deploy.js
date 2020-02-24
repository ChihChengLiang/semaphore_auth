const bre = require('@nomiclabs/buidler')
const ethers = require('ethers')
const {
  REGISTRATION_FEE,
  SEMAPHORE_TREE_DEPTH,
  MIMC_SEED
} = require('../configs')
const mimcGenContract = require('circomlib/src/mimcsponge_gencontract.js')

function buildMimcBytecode () {
  return mimcGenContract.createCode(MIMC_SEED, 220)
}

async function deployContracts ({
  registrationFee = REGISTRATION_FEE,
  compile = false,
  verbose = false
}) {
  if (compile) {
    await bre.run('compile')
  }

  const MiMC = bre.artifacts.require('MiMC')
  const Semaphore = bre.artifacts.require('Semaphore')
  const ProofOfBurn = bre.artifacts.require('ProofOfBurn')

  MiMC.bytecode = buildMimcBytecode()

  const mimcInstance = await MiMC.new()
  await Semaphore.link(mimcInstance)

  const semaphoreInstance = await Semaphore.new(SEMAPHORE_TREE_DEPTH, 0, 0)

  const proofOfBurnInstance = await ProofOfBurn.new(
    semaphoreInstance.address,
    ethers.utils.parseEther(registrationFee.toString())
  )

  await semaphoreInstance.transferOwnership(proofOfBurnInstance.address)

  if (verbose) {
    console.log('MIMC address', mimcInstance.address)
    console.log(`SEMAPHORE_ADDRESS=${semaphoreInstance.address}`)
    console.log(`PROOF_OF_BURN_ADDRESS=${proofOfBurnInstance.address}`)
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
