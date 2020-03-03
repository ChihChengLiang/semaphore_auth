const {
  genIdentity,
  serialiseIdentity,
  unSerialiseIdentity,
  genIdentityCommitment
} = require('libsemaphore')
const { IDENTITIES_DIR } = require('./constants')
const { hostInfo } = require('./config')
const fs = require('fs')
const path = require('path')
const prompts = require('prompts')
const {
  proofOfBurnContract
} = require('semaphore-auth-contracts/src/contracts')
const { REGISTRATION_FEE } = require('semaphore-auth-contracts/constants')
const ethers = require('ethers')

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

const registerIdentityHandler = async () => {
  const ids = fs.readdirSync(IDENTITIES_DIR)

  let selectedId

  if (ids.length === 0) {
    createIdentityHandler()
    selectedId = fs.readdirSync(IDENTITIES_DIR)[0]
  } else if (ids.length === 1) {
    selectedId = ids[0]
  } else if (ids.length > 1) {
    const choices = ids.map(filename => {
      return {
        title: filename,
        value: filename
      }
    })
    const response = await prompts({
      type: 'select',
      name: 'value',
      message: 'Choose an identity you would like to register',
      choices,
      initial: 1
    })
    selectedId = response.value
  } else {
    console.error('Unreachable code')
  }
  idToRegister = unSerialiseIdentity(
    fs.readFileSync(path.join(IDENTITIES_DIR, selectedId))
  )

  console.info(idToRegister)
  const identityCommitment = genIdentityCommitment(idToRegister)
  console.info('Generated identityCommitment', identityCommitment)

  if (hostInfo.get().network === 'local') {
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
    console.info('identityCommitment sent!', receipt.transactionHash)
  } else {
    console.info(
      `Please sent a transaction to ${hostInfo.get().network}: ${hostInfo.get().registrationAddress}`
    )
    console.info(`with identityCommitment as ${identityCommitment.toString()}`)
    console.info(`and with value ${REGISTRATION_FEE.toString()}`)
  }
}

module.exports = {
  createIdentity,
  createIdentityHandler,
  listIdentityHandler,
  registerIdentityHandler
}
