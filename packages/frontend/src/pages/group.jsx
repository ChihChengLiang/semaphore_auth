import React, { useState, useEffect } from 'react'
import { useWeb3Context } from 'web3-react'

import { NewPost } from './posts'
import { Posts } from './posts'
import { fetchGetRegistrationInfo } from '../utils/fetch'
import { checkRegistered } from '../web3/registration'
import { useToasts } from 'react-toast-notifications'

import { CreateIdentity } from './identity'
import { hasId, retrieveId } from '../storage'
import { Activation } from '../web3'
import { Registration } from '../pages/identity'
import ProofOfBurnABI from 'semaphore-auth-contracts/abis/ProofOfBurn.json'
import { ethers } from 'ethers'
import { genIdentityCommitment } from 'libsemaphore'
import { register } from '../web3/registration'

const Group = () => {
  const context = useWeb3Context()
  const { addToast } = useToasts()

  const [idExists, setIdExists] = useState(hasId())
  const [isRegistered, setIsRegistered] = useState(false)
  const [registrationInfo, setRegistrationInfo] = useState({
    serverName: null,
    network: null,
    registrationStyle: null,
    registrationAddress: null,
    semaphoreAddress: null
  })
  const [contract, setContract] = useState(null)

  useEffect(() => {
    let didCancel = false
    const fetchRegistrationInfo = async () => {
      if (registrationInfo.serverName === null) {
        const registrationInfo = await fetchGetRegistrationInfo()
        console.log(registrationInfo)
        if (!didCancel) setRegistrationInfo(registrationInfo)
      }
      if (context.active && registrationInfo.registrationAddress !== null) {
        const provider = new ethers.providers.Web3Provider(
          context.library.provider
        )
        const ProofOfBurn = new ethers.Contract(
          registrationInfo.registrationAddress,
          ProofOfBurnABI,
          provider.getSigner()
        )
        if (!didCancel) setContract(ProofOfBurn)
        if (await checkRegistered(ProofOfBurn)) {
          if (!didCancel) setIsRegistered(true)
        }
      }
    }
    fetchRegistrationInfo()

    return () => {
      didCancel = true
    }
  }, [context.active, registrationInfo.registrationAddress])

  const onIdCreated = () => {
    addToast('Identity created Successfully!', { appearance: 'success' })
    setIdExists(true)
  }

  const _register = async () => {
    const identityCommitment = genIdentityCommitment(retrieveId())
    const tx = await register(contract, identityCommitment)
    addToast(`Registration transaction sent! Transaction ID: ${tx.hash}`, {
      appearance: 'info'
    })

    const receipt = await tx.wait()
    if (receipt.status === 1) {
      addToast('Registration Success!', { appearance: 'success' })
      onRegistered()
    } else {
      addToast(`Registration failed`, {
        appearance: 'error'
      })
    }
  }

  let onboarding = null
  if (!idExists) {
    onboarding = <CreateIdentity onCreated={onIdCreated} />
  } else if (!context.active) {
    onboarding = <Activation />
  } else if (contract !== null) {
    onboarding = <Registration contract={contract} register={_register} />
  } else {
    onboarding = <p>Loading</p>
  }
  return (
    <div className='container'>
      {isRegistered ? (
        <NewPost contract={contract} registrationInfo={registrationInfo} />
      ) : (
        onboarding
      )}

      <hr />
      <Posts />
    </div>
  )
}

export default Group
