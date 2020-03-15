import React from 'react'
import { IdentityPage, IdentityCommitment } from './identity'
import { NewPost } from './posts'
import { hasId } from '../storage'
import { Activation } from '../web3'
import { withWeb3 } from 'web3-react'

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
      hasCommitment: false,
      snarksDownloaded: false
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
      hasCommitment,
      snarksDownloaded
    } = this.state
    if (!isLoaded) {
      return <Loading />
    } else if (!hasIdentity) {
      return <IdentityPage />
    } else if (!this.props.web3.active) {
      return <Activation />
    } else if (!hasCommitment) {
      return <IdentityCommitment />
    } else if (!snarksDownloaded) {
      return <p>We'll need to download some snarks</p>
    } else {
      return <NewPost />
    }
  }
}

export default withWeb3(OnBoarding)
