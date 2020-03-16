import React, { useState } from 'react'
import { Component } from 'react'

import genAuth from '../web3/semaphore'
import { EpochbasedExternalNullifier } from 'semaphore-auth-contracts/lib/externalNullifier'
import { retrieveId } from '../storage'
import { ethers } from 'ethers'
import { fetchGetPosts, fetchPostNewPost } from '../utils/fetch'

const Post = ({ post }) => {
  return (
    <article className='media'>
      <div className='media-content'>
        <div className='content'>
          <strong>{post.id}</strong>
          <p>{post.postBody}</p>
          <small>{post.createdAt}</small>
        </div>
      </div>
    </article>
  )
}

const NewPost = ({ registrationInfo, contract }) => {
  const [postBody, setPostBody] = useState('')

  const publishPost = async () => {
    console.log(postBody)

    const newPostExternalNullifierGen = new EpochbasedExternalNullifier(
      registrationInfo.serverName,
      '/posts/new',
      300 * 1000 // rate limit to 30 seconds
    )
    const signalStr = ethers.utils.hashMessage(postBody)

    const identity = retrieveId()
    const externalNullifierStr = newPostExternalNullifierGen.toString()

    const { proof, publicSignals } = await genAuth(
      externalNullifierStr,
      signalStr,
      identity,
      contract
    )

    await fetchPostNewPost(postBody, proof, publicSignals).then(result =>
      console.info(result)
    )
  }

  return (
    <article className='media'>
      <div className='media-content'>
        <div className='field'>
          <p className='control'>
            <textarea
              className='textarea'
              placeholder="What's on your mind"
              defaultValue={''}
              onChange={e => setPostBody(e.target.value)}
            />
          </p>
        </div>
        <nav className='level'>
          <div className='level-left'></div>
          <div className='level-right'>
            <div className='level-item'>
              <a className='button is-primary' onClick={publishPost}>
                Publish
              </a>
            </div>
          </div>
        </nav>
      </div>
    </article>
  )
}

class Posts extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: null,
      isLoaded: false,
      items: []
    }
  }

  componentDidMount () {
    fetchGetPosts().then(
      result => {
        this.setState({
          isLoaded: true,
          result
        })
      },
      error => {
        this.setState({
          isLoaded: true,
          error
        })
      }
    )
  }

  render () {
    const { error, isLoaded, result } = this.state
    if (error) {
      return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
      return <div>Loading...</div>
    } else {
      return (
        <ul>
          {result.results.map((post, index) => (
            <Post key={index} post={post} />
          ))}
        </ul>
      )
    }
  }
}

export { Posts, NewPost }
