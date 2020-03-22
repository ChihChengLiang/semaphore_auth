const { deployContracts } = require('../src/deploy')
const ethers = require('ethers')

async function main () {
  const verbose = process.argv.includes('--verbose')

  if (process.env.PRIVATE_KEY && process.env.NETWORK) {
    const provider = ethers.getDefaultProvider(process.env.NETWORK)
    const walletWithProvider = new ethers.Wallet(
      process.env.PRIVATE_KEY,
      provider
    )
    await deployContracts({ signer: walletWithProvider, verbose: true })
  } else {
    await deployContracts({ verbose })
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
