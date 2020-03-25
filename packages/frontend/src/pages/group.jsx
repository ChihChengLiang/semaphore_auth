import React, { useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { NewPost, Posts } from './posts'
import DownloadSnarks from '../components/download_snarks'

import { useToasts } from 'react-toast-notifications'

import { CreateIdentity } from './identity'
import { hasId, retrieveId } from '../storage'
import { Activation } from '../web3'
import { Registration } from '../pages/identity'

import { genIdentityCommitment } from 'libsemaphore'
import { register } from '../web3/registration'
import { ProofOfBurn } from '../components/contracts'
import { useProofOfBurn, useIsRegistered } from '../hooks'

const Group = () => {
  const { active } = useWeb3React()
  const { addToast } = useToasts()

  const [idExists, setIdExists] = useState(hasId())
  const contract = useProofOfBurn()
  const [newPostId, setNewPostId] = useState(null)
  const isRegistered = useIsRegistered()
  const forceRerender = useState()[1]

  const [snarksDownloaded, setSnarksDownloaded] = useState(
    window.circuit && window.provingKey
  )

  const onIdCreated = () => {
    addToast('Identity created Successfully!', { appearance: 'success' })
    setIdExists(true)
  }

  const _register = async () => {
    const identityCommitment = genIdentityCommitment(retrieveId())
    let tx
    try {
      tx = await register(contract, identityCommitment)
    } catch (err) {
      addToast(`Registration failed: ${err.message}`, {
        appearance: 'error'
      })
      return
    }

    addToast(`Registration transaction sent! Transaction ID: ${tx.hash}`, {
      appearance: 'info'
    })

    const receipt = await tx.wait()
    if (receipt.status === 1) {
      addToast('Registration Success!', { appearance: 'success' })
      forceRerender()
    } else {
      addToast(`Registration failed`, {
        appearance: 'error'
      })
    }
  }

  const onSnarkDownloaded = () => {
    addToast('Circuit and proving key downloaded', { appearance: 'success' })
    setSnarksDownloaded(true)
  }
  const onPublish = result => {
    console.log(result)
    if (!result.error) {
      setNewPostId(result.postId)
    }
  }

  let onboarding = null
  if (!idExists) {
    onboarding = <CreateIdentity onCreated={onIdCreated} />
  } else if (!active) {
    onboarding = <Activation />
  } else if (!isRegistered) {
    onboarding = <Registration register={_register} />
  } else if (!snarksDownloaded) {
    onboarding = <DownloadSnarks onComplete={onSnarkDownloaded} />
  } else {
    onboarding = <p>Loading</p>
  }
  return (
    <div className='container'>
      {isRegistered && snarksDownloaded ? (
        <NewPost onPublish={onPublish} />
      ) : (
        onboarding
      )}
      <hr />
      <Posts newPostId={newPostId} />
      <ProofOfBurn />
    </div>
  )
}

export default Group
