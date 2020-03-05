const {
  genIdentity,
  serialiseIdentity,
  unSerialiseIdentity,
  genIdentityCommitment
} = require('libsemaphore')
const { IDENTITIES_DIR } = require('./constants')
const { hostInfo, defaultIdentityName } = require('./config')
const fs = require('fs')
const path = require('path')
const prompts = require('prompts')
const {
  proofOfBurnContract
} = require('semaphore-auth-contracts/src/contracts')
const { REGISTRATION_FEE } = require('semaphore-auth-contracts/constants')
const ethers = require('ethers')

const registerByGanache = async identityCommitment => {
  const provider = new ethers.providers.JsonRpcProvider()
  const signer = provider.getSigner()
  const proofOfBurn = proofOfBurnContract(
    signer,
    hostInfo.get().registrationAddress
  )
  const tx = await proofOfBurn.register(identityCommitment.toString(), {
    value: ethers.utils.parseEther(REGISTRATION_FEE.toString())
  })
  const receipt = await tx.wait()
  console.info(
    `Sent identityCommitment to contract: ${proofOfBurn.address} tx: ${receipt.transactionHash}`
  )
}

const registerByMetamask = async identityCommitment => {
  const network = hostInfo.get().network
  const semaphoreABI = require('semaphore-auth-contracts/abis/ProofOfBurn.json')
  require('http')
    .createServer(function (request, response) {
      const content = fs
        .readFileSync(path.join(__dirname, './sendTx.html'))
        .toString()
        .replace('{{{NETWORK}}}', network)
        .replace('{{{ADDRESS}}}', hostInfo.get().registrationAddress)
        .replace('{{{COMMITMENT}}}', identityCommitment)
        .replace('{{{ABI}}}', JSON.stringify(semaphoreABI))
      response.writeHead(200, { 'Content-Type': 'text/html' })
      response.end(content, 'utf-8')
    })
    .listen(8080)
  console.log('Server running at http://127.0.0.1:8080/')
}

const printTx = async identityCommitment => {
  console.info(
    `Please sent a transaction to ${hostInfo.get().network}: ${
      hostInfo.get().registrationAddress
    }`
  )
  console.info(`with identityCommitment as ${identityCommitment.toString()}`)
  console.info(`and with value ${REGISTRATION_FEE.toString()} ether`)
}

const createIdentity = () => {
  const id = genIdentity()
  console.info('Generated Identity', id)

  const filename = id.keypair.pubKey.toString().slice(0, 20)
  const filePath = path.join(IDENTITIES_DIR, filename)
  fs.writeFileSync(filePath, serialiseIdentity(id))
  console.info('Saved identity to ', filePath)
  return { id, filename }
}

const createIdentityHandler = () => {
  createIdentity()
}

const listIdentityHandler = () => {
  const ids = fs.readdirSync(IDENTITIES_DIR)
  for (id of ids) {
    const serialized = fs.readFileSync(path.join(IDENTITIES_DIR, id))
    console.info(unSerialiseIdentity(serialized))
  }
}

const setIdentityHandler = async () => {
  const ids = fs.readdirSync(IDENTITIES_DIR)
  const choices = ids.map(filename => {
    return {
      title: filename,
      value: filename
    }
  })
  const response = await prompts({
    type: 'select',
    name: 'value',
    message: 'Select an identity as a default',
    choices
  })
  selectedId = response.value
  defaultIdentityName.set(selectedId)
  console.info(`Set default id to ${selectedId}`)
}

const registerIdentityHandler = async argv => {
  const idName = defaultIdentityName.get()
  idToRegister = unSerialiseIdentity(
    fs.readFileSync(path.join(IDENTITIES_DIR, idName))
  )

  const identityCommitment = genIdentityCommitment(idToRegister)
  console.info('Generated identityCommitment', identityCommitment)

  if (argv.print) {
    printTx(identityCommitment)
    return
  }

  if (argv.local) {
    await registerByGanache(identityCommitment)
    return
  }

  await registerByMetamask(identityCommitment)
}

module.exports = {
  createIdentity,
  createIdentityHandler,
  listIdentityHandler,
  setIdentityHandler,
  registerIdentityHandler
}
