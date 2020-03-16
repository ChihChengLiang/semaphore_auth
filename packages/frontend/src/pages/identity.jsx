import { genIdentity, serialiseIdentity } from 'libsemaphore'
import { hasId, retrieveId, storeId } from '../storage'
import React, { useState, useEffect } from 'react'
import { checkRegistered } from '../web3/registration'

import { ProofOfBurn } from '../components/contracts'

const Identity = ({ identity }) => {
  return (
    <div className='box is-multiline has-background-light'>
      <div className='content'>
        <h3>This is your identity</h3>
        <code style={{ wordWrap: 'break-word' }}>
          {serialiseIdentity(identity)}
        </code>
      </div>
    </div>
  )
}

const IdentityPage = () => {
  if (hasId()) {
    return <Identity identity={retrieveId()} />
  } else {
    return <p> No Identity Yet</p>
  }
}

const CreateIdentity = ({ onCreated }) => {
  function createIdentity () {
    const identity = genIdentity()
    storeId(identity)
    onCreated()
  }

  return (
    <div className='container'>
      <p>
        Let's create an identity. It contains private information only you can
        know. Guard it with your life
      </p>
      <button onClick={createIdentity} className='button is-primary'>
        Generate Identity
      </button>
    </div>
  )
}

const Registration = ({ contract, register }) => {
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    const _checkRegistered = async () => {
      setIsRegistered(await checkRegistered(contract))
    }
    _checkRegistered()
  }, [isRegistered])
  return (
    <div className='content'>
      <h3>Register your identity to join a Semaphore group</h3>
      <div className='card'>
        <div className='card-content'>
          <ProofOfBurn contract={contract} />
          {isRegistered ? (
            <p>You are registered</p>
          ) : (
            <button onClick={register} className='button is-primary'>
              Register
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export { IdentityPage, Registration, CreateIdentity }
