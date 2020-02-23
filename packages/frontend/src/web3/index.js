import React from 'react'
import { useEffect } from 'react'
import { Connectors, useWeb3Context } from 'web3-react'
const { InjectedConnector } = Connectors

const MetaMask = new InjectedConnector({ supportedNetworks: [1, 4] })

const Activation = () => {
  const context = useWeb3Context()
  useEffect(() => {
    context.setFirstValidConnector(['MetaMask'])
  }, [])

  if (!context.active && !context.error) {
    // loading
    return <p>Loading</p>
  } else if (context.error) {
    //error
    return <p>Error {context.error.toString()}</p>
  } else {
    // success
    return (
      <>
        <h1>Loading sucess</h1>
        {conext => {
          return <p>{conext.account}</p>
        }}
      </>
    )
  }
}

export { Activation, MetaMask }
