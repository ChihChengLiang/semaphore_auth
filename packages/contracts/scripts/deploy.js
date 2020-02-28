const { deployContracts } = require('../lib/deploy')

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
