import { useState, useEffect } from 'react'
import { checkRegistered } from './web3/registration'
import { ProofOfBurnABI } from '@hojicha/common'
import { ethers } from 'ethers'
import { proofOfBurnAddress } from './configs'
import { useWeb3React } from '@web3-react/core'

const useProofOfBurn = () => {
  const { library, active } = useWeb3React()

  if (active) {
    return new ethers.Contract(
      proofOfBurnAddress,
      ProofOfBurnABI,
      library.getSigner()
    )
  } else {
    return null
  }
}

const useIsRegistered = () => {
  const contract = useProofOfBurn()

  const [isRegistered, setIsRegistered] = useState(false)
  useEffect(() => {
    let didCancel = false
    if (contract !== null) {
      checkRegistered(contract).then(result => {
        if (!didCancel) {
          setIsRegistered(result)
        }
      })
    }
    return () => {
      didCancel = true
    }
  }, [contract])
  return isRegistered
}

const useProofOfBurnData = () => {
  const contract = useProofOfBurn()
  const [data, setData] = useState({
    isLoaded: false,
    address: null,
    registrationFee: null,
    commitments: null
  })

  useEffect(() => {
    let didCancel = false
    const fetchContractData = async () => {
      if (contract) {
        const registrationFee = (await contract.registration_fee()).toString()
        const commitments = (await contract.getIdentityCommitments()).length
        if (!didCancel)
          setData({
            isLoaded: true,
            address: contract.address,
            registrationFee,
            commitments
          })
      }
    }
    fetchContractData()
    return () => {
      didCancel = true
    }
  }, [contract])

  return data
}

export { useProofOfBurn, useIsRegistered, useProofOfBurnData}
