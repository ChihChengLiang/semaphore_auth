const fs = require('fs')
const path = require('path')
const { compileContracts } = require('../lib/compile')

const main = async () => {
  const solcs = await compileContracts()

  const SemaphoreABI = solcs['Semaphore.sol'].Semaphore.abi
  const ProofOfBurnABI = solcs['ProofOfBurn.sol'].ProofOfBurn.abi

  saveABI('Semaphore', SemaphoreABI)
  saveABI('ProofOfBurn', ProofOfBurnABI)
}

const saveABI = (contractName, abi) => {
  const toPath = path.join(__dirname, `../abis/${contractName}.json`)

  fs.writeFileSync(
    toPath,
    JSON.stringify(abi, null, 2) // spacing level = 2
  )
  console.log(`${contractName}: Saved ABI to ${toPath}`)
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
