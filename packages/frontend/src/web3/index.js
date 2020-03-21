import React from 'react'
import { Connectors, useWeb3Context } from 'web3-react'
const { InjectedConnector } = Connectors

const MetaMask = new InjectedConnector({ supportedNetworks: [1, 4] })

const Activation = () => {
  const context = useWeb3Context()
  const connectMetaMask = () => {
    context.setFirstValidConnector(['MetaMask'])
  }

  if (!context.active && !context.error) {
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
  } else if (context.error) {
    //error
    return <p>Error {context.error.toString()}</p>
  } else {
    // success
    return (
      <>
        <h1>Loading sucess</h1>
        <p>{context.account}</p>
      </>
    )
  }
}

export { Activation, MetaMask }
