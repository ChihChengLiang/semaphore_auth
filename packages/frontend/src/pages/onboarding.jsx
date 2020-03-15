import React from 'react'
import { IdentityPage } from './identity'
import { NewPost } from './posts'
import { hasId } from '../storage'
import { Activation } from '../web3'
import { withWeb3 } from 'web3-react'
import { RegistrationInfo } from '../components/contracts'

// Generate an Identity
// Activate Metamask
// Check commitment or send one
// Downloading circuits and proving keys
// publish

const Loading = () => <p>Loading...</p>

class OnBoarding extends React.Component {
  constructor () {
    super()
    this.state = {
      isLoaded: false,
      hasIdentity: false,
      hasRegistered: false,
    }
  }

  componentDidMount () {
    if (hasId()) {
      this.setState({ hasIdentity: true })
    }

    this.setState({ isLoaded: true })
  }

  render () {
    const {
      isLoaded,
      hasIdentity,
      hasRegistered
    } = this.state
    if (!isLoaded) {
      return <Loading />
    } else if (!hasIdentity) {
      return <IdentityPage />
    } else if (!this.props.web3.active) {
      return <Activation />
    } else if (!hasRegistered) {
      return (
        <RegistrationInfo
          setRegisteredParent={() => {
            this.setState({ hasRegistered: true })
          }}
        />
      )
    } else {
      return <NewPost />
    }
  }
}

export default withWeb3(OnBoarding)
