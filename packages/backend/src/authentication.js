const {
  validateExternalNullifierMatch,
  validateSignalHash,
  validateNullifierNotSeen,
  validateInRootHistory,
  validateProof
} = require('./validation')

const configs = require('./configs')

const {
  EpochbasedExternalNullifier
} = require('semaphore-auth-contracts/lib/externalNullifier')

const { unstringifyBigInts } = require('libsemaphore')

const newPostExternalNullifierGen = new EpochbasedExternalNullifier(
  configs.SERVER_NAME,
  '/posts/new',
  300 * 1000 // rate limit to 30 seconds
)

// Do semaphore authentication as a middleware
const requireSemaphoreAuth = async (req, res, next) => {
  const rawProof = req.body.proof
  const parsedProof = unstringifyBigInts(JSON.parse(rawProof))
  const parsedPublicSignals = unstringifyBigInts(
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
    // await validateInRootHistory(root)
    await validateNullifierNotSeen(nullifierHash)
    await validateProof(parsedProof, parsedPublicSignals)
  } catch (err) {
    console.log(err)
    res.status(400).end(`Bad Request:${err.toString()}`)
    return
  }

  req.authData = {
    root,
    nullifierHash: nullifierHash.toString(),
    signalHash,
    externalNullifier,
    externalNullifierStr: expectedExternalNullifierStr
  }
  next()
}

module.exports = { requireSemaphoreAuth }
