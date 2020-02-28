const { compileContracts } = require('../lib/compile')
const ethers = require('ethers')
const {
  REGISTRATION_FEE,
  SEMAPHORE_TREE_DEPTH,
  MIMC_SEED
} = require('../constants')

const linker = require('solc/linker')
const mimcGenContract = require('circomlib/src/mimcsponge_gencontract.js')

function buildMimcBytecode () {
  return mimcGenContract.createCode(MIMC_SEED, 220)
}

const linkBytecode = (solcToLink, deployed) => {
  // Assuming only one reference
  const oldBytecode = solcToLink.evm.bytecode.object
  const references = linker.findLinkReferences(oldBytecode)
  const libraryName = Object.keys(references)[0]
  const newBytecode = linker.linkBytecode(oldBytecode, {
    [libraryName]: deployed.address
  })
  return newBytecode
}

async function deployContracts ({
  registrationFee = REGISTRATION_FEE,
  verbose = false
}) {
  const solcs = await compileContracts()

  const MiMCSolc = solcs['MerkleTree.sol'].MiMC
  const SemaphoreSolc = solcs['Semaphore.sol'].Semaphore
  const ProofOfBurnSolc = solcs['ProofOfBurn.sol'].ProofOfBurn

  MiMCSolc.evm.bytecode.object = buildMimcBytecode()
  const provider = new ethers.providers.JsonRpcProvider()
  const signer = provider.getSigner()

  const MiMCContract = ethers.ContractFactory.fromSolidity(MiMCSolc, signer)

  const ProofOfBurnContract = ethers.ContractFactory.fromSolidity(
    ProofOfBurnSolc,
    signer
  )

  const mimcInstance = await (await MiMCContract.deploy()).deployed()

  SemaphoreSolc.evm.bytecode.object = linkBytecode(SemaphoreSolc, mimcInstance)

  const SemaphoreContract = ethers.ContractFactory.fromSolidity(
    SemaphoreSolc,
    signer
  )

  const semaphoreInstance = await (
    await SemaphoreContract.deploy(SEMAPHORE_TREE_DEPTH, 0, 0)
  ).deployed()

  const proofOfBurnInstance = await (
    await ProofOfBurnContract.deploy(
      semaphoreInstance.address,
      ethers.utils.parseEther(registrationFee.toString())
    )
  ).deployed()

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
