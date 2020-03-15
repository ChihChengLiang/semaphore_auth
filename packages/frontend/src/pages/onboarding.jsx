import React, { useEffect, useState } from 'react'
import { CreateIdentity } from './identity'
import { NewPost } from './posts'
import { hasId, retrieveId } from '../storage'
import { Activation } from '../web3'
import { ProofOfBurn } from '../components/contracts'
import { useWeb3Context } from 'web3-react'
import { IdentityCommitment } from '../pages/identity'
import ProofOfBurnABI from 'semaphore-auth-contracts/abis/ProofOfBurn.json'
import { ethers } from 'ethers'
import { genIdentityCommitment } from 'libsemaphore'

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

  useEffect(() => {
    const fetchRegistrationInfo = async () => {
      const registrationInfo = await fetch('http://localhost:5566/info').then(
        res => res.json()
      )
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
      <>
        <ProofOfBurn contract={contract} />
        <IdentityCommitment contract={contract} />
      </>
    )
  } else {
    return <NewPost registrationInfo={registrationInfo} contract={contract} />
  }
}

export default OnBoarding
