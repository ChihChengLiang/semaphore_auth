const {
  validateExternalNullifierMatch,
  validateSignalHash,
  validateNullifierNotSeen,
  validateInRootHistory,
  validateProof
} = require('./validation')

const { EpochbasedExternalNullifier } = require('@hojicha/common')

const { unstringifyBigInts } = require('libsemaphore')

const { SemaphoreLog } = require('./schema')

const newPostExternalNullifierGen = new EpochbasedExternalNullifier(
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
  const content = req.body.postBody

  const expectedExternalNullifierStr = newPostExternalNullifierGen.getString()

  try {
    validateExternalNullifierMatch(
      externalNullifier,
      expectedExternalNullifierStr
    )
    validateSignalHash(content, signalHash)
    await validateInRootHistory(root)
    await validateNullifierNotSeen(nullifierHash)
    await validateProof(parsedProof, parsedPublicSignals)
  } catch (err) {
    next(err)
  }

  const data = {
    root: root.toString(),
    nullifierHash: nullifierHash.toString(),
    externalNullifierStr: expectedExternalNullifierStr,
    signalHash: signalHash.toString(),
    proof: rawProof
  }

  try {
    const semaphoreLog = await SemaphoreLog.query().insert(data)
    req.semaphoreLogId = semaphoreLog.id
  } catch (err) {
    next(err)
  }

  next()
}

module.exports = { requireSemaphoreAuth }
