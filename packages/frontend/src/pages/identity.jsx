import {
  genIdentity,
  genIdentityCommitment,
  serialiseIdentity
} from 'libsemaphore'
import { hasId, retrieveId, storeId } from '../storage'
import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'

const Identity = props => {
  return (
    <div className='box is-multiline has-background-light'>
      <div className='content'>
        <h3>This is your identity</h3>
        <code style={{ wordWrap: 'break-word' }}>
          {serialiseIdentity(props.identity)}
        </code>
      </div>
    </div>
  )
}

const IdentityPage = () => {
  const [idExists, setIdExists] = useState(hasId())
  function createIdentity () {
    const identity = genIdentity()
    storeId(identity)
    setIdExists(true)
  }

  return (
    <div className='container'>
      {idExists ? (
        <>
          <Identity identity={retrieveId()} />
        </>
      ) : (
        <button onClick={createIdentity} className='button is-primary'>
          Generate Identity
        </button>
      )}
    </div>
  )
}

const IdentityCommitment = ({ contract, setRegisteredParent }) => {
  const [isRegistered, setRegistered] = useState(false)

  const _register = async () => {
    const identityCommitment = genIdentityCommitment(retrieveId())
    const registration_fee = await contract.registration_fee()
    const tx = await contract.register(identityCommitment.toString(), {
      value: registration_fee
    })
    const receipt = await tx
    console.log(receipt)
  }

  useEffect(() => {
    const checkRegistered = async () => {
      const commitments = await contract.getIdentityCommitments()
      const identityCommitment = genIdentityCommitment(retrieveId())
      if (
        commitments
          .map(x => x.toString())
          .includes(identityCommitment.toString())
      ) {
        setRegistered(true)
        setRegisteredParent(true)
      }
    }
    checkRegistered()
  }, [])

  return (
    <div className='content'>
      <h3>Identity Commitment</h3>
      {isRegistered ? (
        <p>You are registered</p>
      ) : (
        <button onClick={_register} className='button is-primary'>
          Register
        </button>
      )}
    </div>
  )
}

export { IdentityPage, IdentityCommitment }
