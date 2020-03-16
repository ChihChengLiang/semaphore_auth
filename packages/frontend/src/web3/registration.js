const register = async (contract, identityCommitment) => {
  const registration_fee = await contract.registration_fee()
  return await contract.register(identityCommitment.toString(), {
    value: registration_fee
  })
}

export default register
