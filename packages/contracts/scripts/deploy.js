const bre = require('@nomiclabs/buidler')
const ethers = require('ethers')
const configs = require('../configs')
const mimcGenContract = require('circomlib/src/mimcsponge_gencontract.js')

const MIMC_SEED = 'mimcsponge'
const semaphoreTreeDepth = 12

function buildMimcBytecode () {
  return mimcGenContract.createCode(MIMC_SEED, 220)
}

async function deployContracts (_configs = null) {
  if (_configs === null) _configs = configs

  await bre.run('compile')

  const MiMC = bre.artifacts.require('MiMC')
  const Semaphore = bre.artifacts.require('Semaphore')
  const ProofOfBurn = bre.artifacts.require('ProofOfBurn')

  MiMC.bytecode = buildMimcBytecode()

  const mimcInstance = await MiMC.new()
  await Semaphore.link(mimcInstance)
  const semaphoreInstance = await Semaphore.new(semaphoreTreeDepth, 0, 0)

  const proofOfBurnInstance = await ProofOfBurn.new(
    semaphoreInstance.address,
    ethers.utils.parseEther(configs.REGISTRATION_FEE.toString())
  )

  await semaphoreInstance.transferOwnership(proofOfBurnInstance.address)

  console.log('MiMC address', mimcInstance.address)
  console.log('Semaphore address', semaphoreInstance.address)
  console.log('ProofOfBurn address', proofOfBurnInstance.address)

  return {
    MiMC: mimcInstance,
    Semaphore: semaphoreInstance,
    ProofOfBurn: proofOfBurnInstance
  }
}

async function main () {
  await deployContracts()
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
