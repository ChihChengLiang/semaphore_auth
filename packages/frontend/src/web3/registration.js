import getContracts from './getContracts'
import { ethers } from 'ethers'

const register = async (context, identityCommitment) => {
  const { ProofOfBurn } = getContracts(context.library.provider)
  const registration_fee = await ProofOfBurn.registration_fee()
  console.log('registration_fee', registration_fee)

  return await ProofOfBurn.register(identityCommitment.toString(), {
    value: registration_fee,
    gasLimit: 900000
  })
}

export default register
