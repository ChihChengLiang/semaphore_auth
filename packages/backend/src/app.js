const express = require('express')
const app = express()
const ethers = require('ethers')
const libsemaphore = require('libsemaphore')
const fs = require('fs')
const snarkjs = require('snarkjs')
const { Model } = require('objection')
const { VERIFYING_KEY_PATH } = require('semaphore-auth-contracts/constants')
const { semaphoreContract } = require('semaphore-auth-contracts/src/contracts')
const path = require('path')
const configs = require('./configs')

const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './mydb.sqlite'
  }
})

Model.knex(knex)

class Posts extends Model {
  static get tableName () {
    return 'posts'
  }
}

async function createSchema () {
  if (await knex.schema.hasTable('posts')) {
    return
  }

  await knex.schema.createTable('posts', table => {
    table.increments('id').primary()
    table.string('postBody')

    table.string('proof')

    table.string('root')
    table.string('nullifierHash')
    table.string('signalHash')
    table.string('externalNullifier')

    table
      .dateTime('createdAt')
      .notNullable()
      .defaultTo(knex.fn.now())
  })
}

createSchema()

function validateExternalNullifier (externalNullifier) {
  const legitExternalNullifier = snarkjs.bigInt(
    libsemaphore.genExternalNullifier('ANONlocalhost')
  )
  if (legitExternalNullifier !== externalNullifier) {
    throw Error(
      `Illegal externalNullifier: expect ${legitExternalNullifier}, got ${externalNullifier}`
    )
  }
}

function validateSignalHash () {}
function validateNullifierNotSeen () {}
async function validateInRootHistory (root) {
  const provider = new ethers.providers.JsonRpcProvider()
  const semaphore = semaphoreContract(provider, configs.SEMAPHORE_ADDRESS)

  const isInRootHistory = await semaphore.isInRootHistory(root.toString())
  if (!isInRootHistory) throw Error('Root not in history')
}

async function validateProof (proof, publicSignals) {
  const verifyingKey = libsemaphore.parseVerifyingKeyJson(
    fs.readFileSync(VERIFYING_KEY_PATH).toString()
  )
  const isValid = libsemaphore.verifyProof(verifyingKey, proof, publicSignals)
  if (!isValid) throw Error('Invalid Proof')
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/', express.static(path.join(__dirname, '../../frontend/dist')))

app.get('/info', (req, res) => {
  res.json({
    serverName: 'AwesomeForum',
    network: configs.NETWORK,
    registrationStyle: 'ProofOfBurn',
    registrationAddress: configs.PROOF_OF_BURN_ADDRESS,
    semaphoreAddress: configs.SEMAPHORE_ADDRESS
  })
})

app.get('/posts', async (req, res) => {
  const posts = await Posts.query().orderBy('id')
  res.json({ posts })
})

app.post('/posts/new', async (req, res) => {
  const rawProof = req.body.proof
  const parsedProof = libsemaphore.unstringifyBigInts(JSON.parse(rawProof))
  const parsedPublicSignals = libsemaphore.unstringifyBigInts(
    JSON.parse(req.body.publicSignals)
  )
  const [
    root,
    nullifierHash,
    signalHash,
    externalNullifier
  ] = parsedPublicSignals

  validateExternalNullifier(externalNullifier)
  validateSignalHash(signalHash)
  await validateInRootHistory(root)
  validateNullifierNotSeen(nullifierHash)
  await validateProof(parsedProof, parsedPublicSignals)

  await Posts.query().insert({
    postBody: req.body.postBody,
    proof: rawProof,
    root,
    nullifierHash,
    signalHash,
    externalNullifier
  })
  res.send('OK')
})

module.exports = app
