const fs = require('fs')
const path = require('path')

function copyABI (contractName) {
  const fromPath = `../artifacts/${contractName}.json`
  const toPath = `../abis/${contractName}.json`
  const artifact = require(fromPath)

  fs.writeFileSync(
    path.join(__dirname, toPath),
    JSON.stringify(artifact.abi, null, 2) // spacing level = 2
  )
  console.log(
    `${contractName}: Copied ABI from ${fromPath} to ${toPath}`
  )
}

copyABI('ProofOfBurn')
copyABI('Semaphore')
