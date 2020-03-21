import {
  CIRCUIT_URL,
  PROVING_KEY_URL
} from 'semaphore-auth-contracts/constants'
import fetchProgress from 'fetch-progress'

const _fetch = async (path, options) => {
  console.log(`/api/${path}`)
  const response = await fetch(`/api/${path}`, options)
  return await response.json()
}

const fetchGetPosts = async page => await _fetch(`posts/page/${page}`)

const fetchGetRegistrationInfo = async () => await _fetch('info/')

const fetchPostNewPost = async (postBody, proof, publicSignals) => {
  const options = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ postBody, proof, publicSignals })
  }
  return await _fetch('posts/new', options)
}

import { genCircuit } from 'libsemaphore'

const fetchWithProgress = async (url, onProgress) => {
  // onProgress takes an argument progress that looks like
  // {
  //   total: 132115842,
  //   transferred: 131596288,
  //   speed: 131596288,
  //   eta: 3948090.0859452817,
  //   remaining: 519554,
  //   percentage: 100
  // }
  return await fetch(url).then(fetchProgress({ onProgress }))
}

const fetchCircuit = async onProgress => {
  const response = await fetchWithProgress(CIRCUIT_URL, onProgress)
  const result = await response.json()
  window.circuit = genCircuit(result)
}
const fetchProvingKey = async onProgress => {
  const response = await fetchWithProgress(PROVING_KEY_URL, onProgress)
  const result = await response.arrayBuffer()
  window.provingKey = new Uint8Array(result)
}

export {
  fetchGetPosts,
  fetchPostNewPost,
  fetchGetRegistrationInfo,
  fetchCircuit,
  fetchProvingKey
}
