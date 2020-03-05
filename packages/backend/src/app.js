const express = require('express')
const app = express()
const ethers = require('ethers')
const libsemaphore = require('libsemaphore')
const fs = require('fs')
const snarkjs = require('snarkjs')
const { Model } = require('objection')
const { VERIFYING_KEY_PATH } = require('semaphore-auth-contracts/constants')
const { semaphoreContract } = require('semaphore-auth-contracts/src/contracts')
const {
  EpochbasedExternalNullifier
} = require('semaphore-auth-contracts/lib/externalNullifier')
const path = require('path')
const configs = require('./configs')

const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './mydb.sqlite'
  }
})

Model.knex(knex)

class Post extends Model {
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
    table.string('externalNullifierStr')

    table
      .dateTime('createdAt')
      .notNullable()
      .defaultTo(knex.fn.now())
  })
}

createSchema()

function validateExternalNullifierMatch (actual, externalNullifierStr) {
  const expected = snarkjs.bigInt(
    libsemaphore.genExternalNullifier(externalNullifierStr)
  )
  if (expected !== actual) {
    throw Error(
      `Illegal externalNullifier: expect "${expected}" (${externalNullifierStr}), got "${actual}"`
    )
  }
}

function validateSignalHash (postBody, actual) {
  const signalStr = ethers.utils.hashMessage(postBody)
  const expected = libsemaphore.keccak256HexToBigInt(
    ethers.utils.hexlify(ethers.utils.toUtf8Bytes(signalStr))
  )
  if (actual !== expected) {
    throw Error(`Expected signalHash ${expected}, got ${actual}`)
  }
}
async function validateNullifierNotSeen (nullifierHash) {
  const results = await Post.query()
    .select('nullifierHash', 'externalNullifierStr', 'id')
    .where('nullifierHash', nullifierHash.toString())
    .catch(console.error)

  if (results.length > 0) {
    const post = results[0]
    throw new Error(
      `Spam post: nullifierHash (${nullifierHash}) has been seen before for the same external nullifier "${post.externalNullifierStr}" in post id ${post.id}`
    )
  }
}
async function validateInRootHistory (root) {
  const provider = new ethers.providers.JsonRpcProvider()
  const semaphore = semaphoreContract(provider, configs.SEMAPHORE_ADDRESS)

  const isInRootHistory = await semaphore.isInRootHistory(
    libsemaphore.stringifyBigInts(root)
  )
  if (!isInRootHistory) throw Error(`Root (${root.toString()}) not in history`)
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

const newPostExternalNullifierGen = new EpochbasedExternalNullifier(
  configs.SERVER_NAME,
  '/posts/new',
  300 * 1000 // rate limit to 30 seconds
)

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
  const postBody = req.body.postBody

  const expectedExternalNullifierStr = newPostExternalNullifierGen.toString()

  try {
    validateExternalNullifierMatch(
      externalNullifier,
      expectedExternalNullifierStr
    )
    validateSignalHash(postBody, signalHash)
    await validateInRootHistory(root)
    await validateNullifierNotSeen(nullifierHash)
    await validateProof(parsedProof, parsedPublicSignals)
  } catch (err) {
    res.status(400).end(`Bad Request:${err.toString()}`)
    return
  }

  await Post.query()
    .insert({
      postBody,
      proof: rawProof,
      root,
      nullifierHash: nullifierHash.toString(),
      signalHash,
      externalNullifier,
      externalNullifierStr: expectedExternalNullifierStr
    })
    .catch(console.error)
  res.send('OK')
})

module.exports = app
