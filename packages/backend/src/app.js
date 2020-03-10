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

app.post('/posts/new', requireSemaphoreAuth, async (req, res, next) => {
  const post = await Post.query()
    .insert({
      postBody: req.body.postBody,
      semaphoreLogId: req.semaphoreLogId
    })
    .catch(next)
  res.send(`Your article is published! Article id: ${post.id}`)
})

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send(err.toString())
})

module.exports = app
