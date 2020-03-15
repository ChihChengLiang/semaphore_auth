import {
  genIdentity,
  genIdentityCommitment,
  serialiseIdentity
} from 'libsemaphore'
import register from '../web3/registration'
import { useState } from 'react'
import { hasId, retrieveId, storeId } from '../storage'
import React from 'react'
import { Connectors, useWeb3Context } from 'web3-react'

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
          <IdentityCommitment />
        </>
      ) : (
        <button onClick={createIdentity} className='button is-primary'>Generate Identity</button>
      )}
    </div>
  )
}

const IdentityCommitment = () => {
  const context = useWeb3Context()
  const _register = async () => {
    const identityCommitment = genIdentityCommitment(retrieveId())
    await register(context, identityCommitment)
  }

  return (
    <div className='content'>
      <h3>Identity Commitment</h3>
      <button onClick={_register} className='button is-primary'>Register</button>
    </div>
  )
}

export { IdentityPage }
