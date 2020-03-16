import { hasId, retrieveId } from '../storage'
import { genIdentityCommitment } from 'libsemaphore'

const checkRegistered = async contract => {
  if (!hasId()) {
    return false
  } else {
    const commitments = await contract.getIdentityCommitments()
    const identityCommitment = genIdentityCommitment(retrieveId())
    return commitments
      .map(x => x.toString())
      .includes(identityCommitment.toString())
  }
}

const register = async (contract, identityCommitment) => {
  const registration_fee = await contract.registration_fee()
  return await contract.register(identityCommitment.toString(), {
    value: registration_fee
  })
}

export { register, checkRegistered }
