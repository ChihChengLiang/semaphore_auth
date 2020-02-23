import React from 'react'

import ReactDOM from 'react-dom'
import bulma from 'bulma'
import Nav from './nav'
import { initStorage } from './storage'
import Web3Provider from 'web3-react'

import { Activation, MetaMask } from './web3'

import PostPage from './pages/posts'
import { IdentityCommitment, IdentityManagement } from './pages/identity'

const App = () => {
  initStorage()
  return (
    <Web3Provider connectors={{ MetaMask }} libraryName='ethers.js'>
      <Activation />
      <IdentityCommitment />
      <div className='section'>
        <div className='container'>
          <IdentityManagement />
          <PostPage />
        </div>
      </div>
    </Web3Provider>
  )
}

const root = document.getElementById('root')

ReactDOM.render(<App />, root)
