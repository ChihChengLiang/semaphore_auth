const { deployContracts } = require('../src/deploy')
const ethers = require('ethers')
const fs = require('fs')
const path = require('path')

const deployWithSigners = async ({ network }) => {
  const provider = ethers.getDefaultProvider(network)

  let signer
  if (process.env.PRIVATE_KEY) {
    signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
  } else if (process.env.JSONPATH && process.env.PASSWORD) {
    const json = fs.readFileSync(path.join(__dirname, process.env.JSONPATH))
    signer = await ethers.Wallet.fromEncryptedJson(json, process.env.PASSWORD)
    signer = signer.connect(provider)
  }
  console.log(signer)

  await deployContracts({ signer, verbose: true })
}

async function main () {
  const verbose = process.argv.includes('--verbose')

  const network = process.env.NETWORK

  if (!network) {
    await deployContracts({ verbose })
  } else {
    await deployWithSigners({ network })
  }
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
