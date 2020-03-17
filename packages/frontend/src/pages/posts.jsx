import React, { useState, useEffect } from 'react'
import { Component } from 'react'

import genAuth from '../web3/semaphore'
import { EpochbasedExternalNullifier } from 'semaphore-auth-contracts/lib/externalNullifier'
import { retrieveId } from '../storage'
import { ethers } from 'ethers'
import { fetchGetPosts, fetchPostNewPost } from '../utils/fetch'
import { useToasts } from 'react-toast-notifications'

const SemaphoreDescriptions = {
  externalNullifierStr:
    'This limits the rate the author can publish a content in a period of time.',
  nullifierHash:
    'Is unique given the same externalNullifier and identity, meaning the author can publish at most once between the time period',
  signalHash: "Is the content's hash and protects the content's authenticity",
  root:
    'Is the root of the identity hash tree and is stored on chain. The author proves being a member of this root represents',
  proof: 'Claims the correctness of the above statements.'
}

const Semaphore = ({ post }) => {
  return (
    <div className='card'>
      <div
        className='card-content is-small has-background-light'
        style={{ wordBreak: 'break-all' }}
      >
        <p>
          The proof is validated at backend, and frontend validation will be
          implemented in the next version. For now, information is displayed for
          the demonstration of the usage.
        </p>
        {Object.keys(SemaphoreDescriptions).map(key => (
          <div key={key}>
            <h5>{key}</h5>
            <p>{SemaphoreDescriptions[key]}</p>
            <code>{post[key]}</code>
            <hr />
          </div>
        ))}
      </div>
    </div>
  )
}

const Post = ({ post, isNew }) => {
  const [on, toggle] = useState(false)
  return (
    <article className='media'>
      <div className='media-left'>
        <h4 className='has-text-grey'>{post.id}</h4>
      </div>
      <div className='media-content'>
        <div className='content'>
          {isNew ? <span className='tag'>new</span> : ''}
          <p>{post.postBody}</p>
          <div className='level'>
            <div className='level-left'>
              <div className='level-item'>
                <small>{post.createdAt}</small>
              </div>
              <div className='level-item'>
                <button className='button is-small' onClick={() => toggle(!on)}>
                  Toggle Proofs
                </button>
              </div>
            </div>
          </div>

          {on ? <Semaphore post={post} /> : ''}
        </div>
      </div>
    </article>
  )
}

const NewPost = ({ registrationInfo, contract, onPublish }) => {
  const [postBody, setPostBody] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { addToast, updateToast } = useToasts()

  let toastId = null
  const progressCallback = ({ text, appearance = 'info' }) => {
    const setToastId = id => (toastId = id)
    if (toastId == null) {
      addToast(text, { appearance }, setToastId)
    } else {
      updateToast(toastId, { content: text, appearance }, setToastId)
    }
  }

  const publishPost = async () => {
    console.log(postBody)

    setIsLoading(true)

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
      contract,
      progressCallback
    )

    const result = await fetchPostNewPost(postBody, proof, publicSignals)
    if (result.error) {
      progressCallback({ text: result.error, appearance: 'error' })
    } else {
      progressCallback({ text: result.message, appearance: 'success' })
    }
    onPublish(result)
    setIsLoading(false)
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
              <a
                className={`button is-primary ${isLoading ? 'is-loading' : ''}`}
                onClick={publishPost}
              >
                Publish
              </a>
            </div>
          </div>
        </nav>
      </div>
    </article>
  )
}

const Posts = ({ newPostId }) => {
  const [error, setError] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [items, setItems] = useState([])
  const [page, setPage] = useState(0)

  const loadMore = async (_page, _items) => {
    try {
      const result = await fetchGetPosts(_page)
      if (result.next !== null) {
        setPage(_page + 1)
      } else {
        setPage(null)
      }
      setItems(_items.concat(result.results))
    } catch (error) {
      setError(error)
    }
    setIsLoaded(true)
  }

  useEffect(() => {
    let _page = page
    let _items = items

    // If a new post published, load new posts from server before rerender
    if (newPostId > Math.max(...items.map(post => post.id))) {
      _page = 0
      setPage(0)
      _items = []
      setItems([])
    }
    loadMore(_page, _items)
  }, [newPostId])
  if (error) {
    return <div>Error: {error.message}</div>
  } else if (!isLoaded) {
    return <div>Loading...</div>
  } else {
    return (
      <>
        <ul>
          {items.map((post, index) => (
            <Post key={index} post={post} isNew={newPostId === post.id} />
          ))}
        </ul>
        <>
          {page ? (
            <button
              className='button is-primary'
              onClick={() => loadMore(page, items)}
            >
              Load More
            </button>
          ) : (
            <hr />
          )}
        </>
      </>
    )
  }
}

export { Posts, NewPost }
