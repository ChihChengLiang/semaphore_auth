import React, { useState } from 'react'
import { supportedNetwork } from '../configs'
import { InjectedConnector } from '@web3-react/injected-connector'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'

const getLibrary = provider => {
  const library = new ethers.providers.Web3Provider(provider)
  return library
}

const MetaMask = new InjectedConnector({
  supportedChainIds: [supportedNetwork]
})

const Activation = () => {
  const { activate, active, account } = useWeb3React()
  const [error, setError] = useState(null)

  const connectMetaMask = async () => {
    try {
      await activate(MetaMask, undefined, true)
    } catch (err) {
      setError(err)
    }
  }

  if (!active && !error) {
    return (
      <>
        <p>
          Please connect to MetaMask, we are about to read/write some
          information on the contract.
        </p>
        <button className='button is-primary' onClick={connectMetaMask}>
          Connect MetaMask
        </button>
      </>
    )
  } else if (error) {
    //error
    return <p>Error {error.toString()}</p>
  } else {
    // success
    return (
      <>
        <h1>Loading sucess</h1>
        <p>{account}</p>
      </>
    )
  }
}

export { Activation, MetaMask, getLibrary }
