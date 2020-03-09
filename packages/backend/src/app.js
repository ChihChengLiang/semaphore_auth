const express = require('express')
const app = express()

const configs = require('./configs')
const { createSchema, Post } = require('./schema')
const { requireSemaphoreAuth } = require('./authentication')

createSchema()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/info', (req, res) => {
  res.json({
    serverName: configs.SERVER_NAME,
    network: configs.NETWORK,
    registrationStyle: 'ProofOfBurn',
    registrationAddress: configs.PROOF_OF_BURN_ADDRESS,
    semaphoreAddress: configs.SEMAPHORE_ADDRESS
  })
})

app.get('/posts', async (req, res) => {
  const posts = await Post.query().orderBy('id', 'desc')
  res.json({ posts })
})

app.post('/posts/new', requireSemaphoreAuth, async (req, res) => {
  const {
    root,
    nullifierHash,
    signalHash,
    externalNullifier,
    externalNullifierStr
  } = req.authData
  await Post.query()
    .insert({
      postBody: req.body.postBody,
      proof: req.body.proof,
      root,
      nullifierHash,
      signalHash,
      externalNullifier,
      externalNullifierStr
    })
    .catch(err => {
      console.error(err)
      res.status(500).end(err.toString())
    })
  res.send('OK')
})

module.exports = app
