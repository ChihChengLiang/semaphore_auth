const fs = require('fs')
const path = require('path')

const ethers = require('ethers')
const prompts = require('prompts')

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

const fetch = require('node-fetch')

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

const viewPostHandler = async () => {
  const posts = await fetch('http://localhost:5566/posts')
    .then(res => res.json())
    .then(result => result.posts)
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

const newPostHandler = async argv => {
  const articlePath = argv.article
  const article = fs
    .readFileSync(path.join(process.cwd(), articlePath))
    .toString()

  const signalStr = ethers.utils.hashMessage(article)
  console.info(signalStr)

  const { proof, publicSignals } = await genAuth('ANONlocalhost', signalStr)

  //   fs.writeFileSync(path.join(process.cwd(), "foo.cache"), JSON.stringify({ proof, publicSignals }))
  //   const { proof, publicSignals } = JSON.parse(
  //     fs.readFileSync(path.join(process.cwd(), 'foo.cache'))
  //   )
  console.log(publicSignals)

  // Request backend /posts/new

  await fetch('http://localhost:5566/posts/new', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ postBody: article, proof, publicSignals })
  })
    .then(res => res.text())
    .then(result => console.info(result))
}

module.exports = { newPostHandler, viewPostHandler }
