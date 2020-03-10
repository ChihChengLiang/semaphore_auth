const fs = require('fs')
const path = require('path')

const ethers = require('ethers')
const prompts = require('prompts')

const { semaphoreContract } = require('semaphore-auth-contracts/src/contracts')
const { SEMAPHORE_TREE_DEPTH } = require('semaphore-auth-contracts/constants')
const {
  EpochbasedExternalNullifier
} = require('semaphore-auth-contracts/lib/externalNullifier')
const {
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
const { defaultIdentityName, hostInfo } = require('./config')

const fetch = require('node-fetch')

const { getProvider } = require('./provider')

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
  const provider = getProvider()

  const identityName = defaultIdentityName.get()
  spinner.info(`Using defaultIdentityName: ${identityName}`)
  const identity = unSerialiseIdentity(
    fs.readFileSync(path.join(IDENTITIES_DIR, identityName))
  )
  spinner.start()
  spinner.text = 'Formatting intputs'
  const circuit = genCircuit(cirDef)
  const semaphoreInstance = semaphoreContract(
    provider,
    hostInfo.get().semaphoreAddress
  )
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

const viewPostHandler = async () => {
  const posts = await fetch(new URL('./posts', hostInfo.get().hostUrl))
    .then(res => res.json())
    .then(result => result.posts)

  console.clear()
  const response = await prompts({
    type: 'select',
    name: 'value',
    message: 'Read the latest posts',
    choices: posts.map(post => {
      return {
        title: `${post.id}  ${post.postBody.slice(0, 20)}`,
        value: post
      }
    })
  })
  console.info(`Article #${response.value.id}`)
  console.info(response.value.postBody)
}

const newPostExternalNullifierGen = new EpochbasedExternalNullifier(
  hostInfo.get().serverName,
  '/posts/new',
  300 * 1000 // rate limit to 30 seconds
)

const newPostHandler = async argv => {
  console.clear()
  const articlePath = argv.article
  const article = fs
    .readFileSync(path.join(process.cwd(), articlePath))
    .toString()

  const signalStr = ethers.utils.hashMessage(article)

  const externalNullifierStr = newPostExternalNullifierGen.toString()
  console.info('Using externalNullifierStr as:', externalNullifierStr)
  const { proof, publicSignals } = await genAuth(
    externalNullifierStr,
    signalStr
  )

  await fetch(new URL('./posts/new', hostInfo.get().hostUrl), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ postBody: article, proof, publicSignals })
  })
    .then(res => res.text())
    .then(result => console.info(result))
    .catch(error => console.error(error))
}

module.exports = { newPostHandler, viewPostHandler }
