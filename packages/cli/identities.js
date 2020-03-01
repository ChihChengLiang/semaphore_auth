const {
  genIdentity,
  serialiseIdentity,
  unSerialiseIdentity
} = require('libsemaphore')
const { IDENTITIES_DIR } = require('./constants')
const fs = require('fs')
const path = require('path')

const createIdentityHandler = () => {
  const id = genIdentity()
  console.info('Generated Identity', id)

  const filename = id.keypair.pubKey.toString().slice(0, 20)
  const filePath = path.join(IDENTITIES_DIR, filename)
  fs.writeFileSync(filePath, serialiseIdentity(id))
  console.info('Saved identity to ', filePath)
}

const listIdentityHandler = () => {
  const ids = fs.readdirSync(IDENTITIES_DIR)
  for (id of ids) {
    const serialized = fs.readFileSync(path.join(IDENTITIES_DIR, id))
    console.info(unSerialiseIdentity(serialized))
  }
}

module.exports = {
  createIdentityHandler,
  listIdentityHandler
}
