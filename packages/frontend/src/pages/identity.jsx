import { genIdentity, genIdentityCommitment } from 'libsemaphore'
import register from '../web3/registration'
import { useState } from 'react'
import { hasId, retrieveId, storeId } from '../storage'
import React from 'react'
import { Connectors, useWeb3Context } from 'web3-react'

const Identity = props => {
  return (
    <>
      <p>pubkey: {props.identity.keypair.pubKey.map(x => x.toString())}</p>
      <p>privatekey: {props.identity.keypair.privKey}</p>
      <p>identityNullifier: {props.identity.identityNullifier.toString()}</p>
      <p>identityTrapdoor: {props.identity.identityTrapdoor.toString()}</p>
    </>
  )
}

const IdentityManagement = () => {
  const [idExists, setIdExists] = useState(hasId())
  function createIdentity () {
    const identity = genIdentity()
    storeId(identity)
    setIdExists(true)
  }

  return (
    <>
      <h1>Identity</h1>
      {idExists ? (
        <Identity identity={retrieveId()} />
      ) : (
        <button onClick={createIdentity}>Generate Identity</button>
      )}
    </>
  )
}

const IdentityCommitment = () => {
  const context = useWeb3Context()
  const _register = async () => {
    const identityCommitment = genIdentityCommitment(retrieveId())
    await register(context, identityCommitment)
  }

  return (
    <>
      <p>Identity Commitment</p>
      <button onClick={_register}>Register</button>
    </>
  )
}

export { IdentityCommitment, IdentityManagement }
