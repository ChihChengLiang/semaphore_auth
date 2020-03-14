const express = require('express')
const app = express()

const configs = require('./configs')
const { createSchema } = require('./schema')
const { posts } = require('./posts')

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

app.use('/posts', posts)

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send(err.toString())
})

module.exports = app
