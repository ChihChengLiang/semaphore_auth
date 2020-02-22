import ProofOfBurnABI from 'semaphore-auth-contracts/abis/ProofOfBurn.json'
import SemaphoreABI from 'semaphore-auth-contracts/abis/Semaphore.json'
import { ethers } from 'ethers'
import { PROOF_OF_BURN_ADDRESS, SEMAPHORE_ADDRESS } from '../configs'

function getContracts (_provider) {
  const provider = new ethers.providers.Web3Provider(_provider)
  console.log('PROOF_OF_BURN_ADDRESS', PROOF_OF_BURN_ADDRESS)
  console.log('SEMAPHORE_ADDRESS', SEMAPHORE_ADDRESS)

  const ProofOfBurn = new ethers.Contract(
    PROOF_OF_BURN_ADDRESS,
    ProofOfBurnABI,
    provider
  )
  const Semaphore = new ethers.Contract(
    SEMAPHORE_ADDRESS,
    SemaphoreABI,
    provider
  )
  return {
    ProofOfBurn,
    Semaphore
  }
}

export default getContracts
