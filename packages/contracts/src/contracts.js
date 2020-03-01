const ethers = require('ethers')
const proofOfBurnAbi = require('../abis/ProofOfBurn.json')
const semaphoreAbi = require('../abis/Semaphore.json')

const semaphoreContract = (provider, address) =>
  new ethers.Contract(address, semaphoreAbi, provider)
const proofOfBurnContract = (provider, address) =>
  new ethers.Contract(address, proofOfBurnAbi, provider)

module.exports = {
  semaphoreContract,
  proofOfBurnContract
}
