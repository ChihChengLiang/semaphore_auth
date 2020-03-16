const ROOT_URL = 'http://localhost:5566'

const _fetch = async (path, options) => {
  const response = await fetch(new URL(path, ROOT_URL), options)
  return await response.json()
}

const fetchGetPosts = async () => await _fetch('./posts/')

const fetchGetRegistrationInfo = async () => await _fetch('./info/')

const fetchPostNewPost = async (postBody, proof, publicSignals) => {
  const options = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ postBody, proof, publicSignals })
  }
  return await _fetch('./posts/new', options)
}

export { fetchGetPosts, fetchPostNewPost, fetchGetRegistrationInfo }
