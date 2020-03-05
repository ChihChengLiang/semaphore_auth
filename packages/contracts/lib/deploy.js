const { compileContracts } = require('./compile')
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

const defaultSigner = () => {
  const provider = new ethers.providers.JsonRpcProvider()
  return provider.getSigner()
}

async function deployContracts ({
  signer = defaultSigner(),
  registrationFee = REGISTRATION_FEE,
  verbose = false
}) {
  if (verbose) console.log('deploying')
  const solcs = await compileContracts()
  if (verbose) console.log('compiled')

  const MiMCSolc = solcs['MerkleTree.sol'].MiMC
  const SemaphoreSolc = solcs['Semaphore.sol'].Semaphore
  const ProofOfBurnSolc = solcs['ProofOfBurn.sol'].ProofOfBurn

  MiMCSolc.evm.bytecode.object = buildMimcBytecode()

  const MiMCContract = ethers.ContractFactory.fromSolidity(MiMCSolc, signer)

  const ProofOfBurnContract = ethers.ContractFactory.fromSolidity(
    ProofOfBurnSolc,
    signer
  )
  const mimcTx = await MiMCContract.deploy()
  if (verbose) console.log('mimcTx', mimcTx.deployTransaction.hash)
  const mimcInstance = await mimcTx.deployed()

  SemaphoreSolc.evm.bytecode.object = linkBytecode(SemaphoreSolc, mimcInstance)

  const SemaphoreContract = ethers.ContractFactory.fromSolidity(
    SemaphoreSolc,
    signer
  )

  const semaphoreTx = await SemaphoreContract.deploy(SEMAPHORE_TREE_DEPTH, 0, 0)
  if (verbose) console.log('semaphoreTx', semaphoreTx.deployTransaction.hash)
  const semaphoreInstance = await semaphoreTx.deployed()

  const proofOfBurnTx = await ProofOfBurnContract.deploy(
    semaphoreInstance.address,
    ethers.utils.parseEther(registrationFee.toString())
  )
  if (verbose)
    console.log('proofOfBurnTx', proofOfBurnTx.deployTransaction.hash)
  const proofOfBurnInstance = await proofOfBurnTx.deployed()

  await semaphoreInstance.transferOwnership(proofOfBurnInstance.address)

  if (verbose) {
    console.log(`SEMAPHORE_ADDRESS=${semaphoreInstance.address}`)
    console.log(`PROOF_OF_BURN_ADDRESS=${proofOfBurnInstance.address}`)
  }

  return {
    MiMC: mimcInstance,
    Semaphore: semaphoreInstance,
    ProofOfBurn: proofOfBurnInstance
  }
}

module.exports = { deployContracts }
