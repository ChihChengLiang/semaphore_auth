import React, { useEffect, useState } from 'react'
import { CreateIdentity } from './identity'
import { NewPost } from './posts'
import { hasId, retrieveId } from '../storage'
import { Activation } from '../web3'
import { useWeb3Context } from 'web3-react'
import { Registration } from '../pages/identity'
import ProofOfBurnABI from 'semaphore-auth-contracts/abis/ProofOfBurn.json'
import { ethers } from 'ethers'
import { genIdentityCommitment } from 'libsemaphore'
import register from '../web3/registration'
import { fetchGetRegistrationInfo } from '../utils/fetch'

// Generate an Identity
// Activate Metamask
// Check commitment or send one
// Downloading circuits and proving keys
// publish

const checkRegistered = async contract => {
  const commitments = await contract.getIdentityCommitments()
  const identityCommitment = genIdentityCommitment(retrieveId())
  return commitments
    .map(x => x.toString())
    .includes(identityCommitment.toString())
}

const OnBoarding = () => {
  const context = useWeb3Context()
  const [idExists, setIdExists] = useState(hasId())
  const [registrationInfo, setRegistrationInfo] = useState({
    serverName: null,
    network: null,
    registrationStyle: null,
    registrationAddress: null,
    semaphoreAddress: null
  })
  const [contract, setContract] = useState(null)
  const [isRegistered, setIsRegistered] = useState(false)

  const _register = async () => {
    const identityCommitment = genIdentityCommitment(retrieveId())
    const tx = await register(contract, identityCommitment)

    const receipt = await tx.wait()
    if (receipt.status === 1) {
      setIsRegistered(true)
    }
  }

  useEffect(() => {
    const fetchRegistrationInfo = async () => {
      const registrationInfo = await fetchGetRegistrationInfo()
      console.log(registrationInfo)

      setRegistrationInfo(registrationInfo)
      if (context.active) {
        const provider = new ethers.providers.Web3Provider(
          context.library.provider
        )
        const ProofOfBurn = new ethers.Contract(
          registrationInfo.registrationAddress,
          ProofOfBurnABI,
          provider.getSigner()
        )
        setContract(ProofOfBurn)

        if (await checkRegistered(ProofOfBurn)) {
          setIsRegistered(true)
        }
      }
    }
    fetchRegistrationInfo()
  }, [context.active])

  if (!idExists) {
    return <CreateIdentity setIdExists={setIdExists} />
  } else if (!context.active) {
    return <Activation />
  } else if (!registrationInfo.registrationAddress) {
    return <p>Loading Registration Information</p>
  } else if (!contract) {
    return <p>Building contract</p>
  } else if (!isRegistered) {
    return (
      <Registration
        contract={contract}
        isRegistered={isRegistered}
        register={_register}
      />
    )
  } else {
    return <NewPost registrationInfo={registrationInfo} contract={contract} />
  }
}

export default OnBoarding
