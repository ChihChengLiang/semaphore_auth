const fs = require('fs')
const path = require('path')

const ethers = require('ethers')

const { semaphoreContract } = require('semaphore-auth-contracts/src/contracts')
const { SEMAPHORE_TREE_DEPTH } = require('semaphore-auth-contracts/constants')
const {
  SEMAPHORE_ADDRESS,
  CIRCUIT_PATH,
  PROVING_KEY_PATH,
  IDENTITIES_DIR
} = require('./constants')
const {
  genCircuit,
  genExternalNullifier,
  genWitness,
  genProof,
  genPublicSignals,
  stringifyBigInts,
  unSerialiseIdentity,
  genIdentityCommitment
} = require('libsemaphore')
const ora = require('ora')
const { defaultIdentityName } = require('./config')

const genAuth = async (externalNullifierStr, signalStr) => {
  const spinner = ora({
    discardStdin: false,
    text: 'Generating Authentication Data'
  }).start()

  spinner.text = 'Loading circuit'
  const cirDef = require(CIRCUIT_PATH)

  spinner.text = 'Loading provingKey'
  const provingKey = fs.readFileSync(PROVING_KEY_PATH)
  spinner.text = 'Get provider'
  const provider = new ethers.providers.JsonRpcProvider()

  const identityName = defaultIdentityName.get()
  const identity = unSerialiseIdentity(
    fs.readFileSync(path.join(IDENTITIES_DIR, identityName))
  )

  spinner.text = 'Formatting intputs'
  const circuit = genCircuit(cirDef)
  const semaphoreInstance = semaphoreContract(provider, SEMAPHORE_ADDRESS)
  const id_tree_index = await semaphoreInstance.getIdTreeIndex()
  const leaves = await semaphoreInstance.leaves(id_tree_index)

  if (
    !leaves
      .map(leaf => leaf.toString())
      .includes(genIdentityCommitment(identity).toString())
  ) {
    spinner.fail(
      `Could not find commitment of identity ${identityName} in leaves. Please register identity first`
    )
  }

  const externalNullifier = genExternalNullifier(externalNullifierStr)

  spinner.text = 'Generating witness'
  const { witness } = await genWitness(
    signalStr,
    circuit,
    identity,
    leaves,
    SEMAPHORE_TREE_DEPTH,
    externalNullifier
  )
  spinner.text = 'Generating proof'
  const proof = await genProof(witness, provingKey)

  spinner.text = 'Generating publicSignals'
  const publicSignals = genPublicSignals(witness, circuit)
  output = {
    proof: JSON.stringify(stringifyBigInts(proof)),
    publicSignals: JSON.stringify(stringifyBigInts(publicSignals))
  }
  spinner.succeed('Done generating authentication data')
  return output
}

const newPostHandler = async argv => {
  const articlePath = argv.article
  const article = fs.readFileSync(path.join(process.cwd(), articlePath))
  console.info(article.toString())
  const signalStr = ethers.utils.hashMessage(article.toString())
  console.info(signalStr)

  const authData = await genAuth('ANONlocalhost', signalStr)
  return {}

  // Request backend /posts/new

  //   {
  //    postBody: 'foooooo',
  //    proof: stringfiedProof,
  //    publicSignals: stringfiedPublicSignals
  //     }
}

module.exports = { newPostHandler }
