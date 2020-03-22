import {
  genExternalNullifier,
  genWitness,
  genProof,
  genPublicSignals,
  stringifyBigInts
} from 'libsemaphore'

import { SEMAPHORE_TREE_DEPTH } from '@hojicha/contracts/constants'

const genAuth = async (
  externalNullifierStr,
  signalStr,
  identity,
  contract,
  progressCallback
) => {
  const circuit = window.circuit
  const provingKey = window.provingKey

  const leaves = await contract.getIdentityCommitments()

  const externalNullifier = genExternalNullifier(externalNullifierStr)

  progressCallback({ text: 'Generating Witness ...' })

  const t1 = performance.now()
  const { witness } = await genWitness(
    signalStr,
    circuit,
    identity,
    leaves,
    SEMAPHORE_TREE_DEPTH,
    externalNullifier
  )
  const genWitnessTime = ((performance.now() - t1) / 1000).toFixed(2)

  progressCallback({
    text: `
    Witness generated (${genWitnessTime} s).
    Generating proof and public signals ...`
  })

  const t2 = performance.now()
  const proof = await genProof(witness, provingKey)
  const publicSignals = genPublicSignals(witness, circuit)
  const genProofTime = ((performance.now() - t2) / 1000).toFixed(2)
  progressCallback({ text: `Proof generated (${genProofTime} s)` })

  const requestData = {
    proof: JSON.stringify(stringifyBigInts(proof)),
    publicSignals: JSON.stringify(stringifyBigInts(publicSignals))
  }
  return requestData
}

export default genAuth
