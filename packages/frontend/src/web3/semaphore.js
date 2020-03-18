import {
  genCircuit,
  genExternalNullifier,
  genWitness,
  genProof,
  genPublicSignals,
  stringifyBigInts
} from 'libsemaphore'

import {
  SEMAPHORE_TREE_DEPTH,
  CIRCUIT_URL,
  PROVING_KEY_URL
} from 'semaphore-auth-contracts/constants'

const fetchWithoutCache = url => fetch(url, { cache: 'no-store' })

const genAuth = async (
  externalNullifierStr,
  signalStr,
  identity,
  contract,
  progressCallback
) => {
  console.log('Downloading circuit')
  progressCallback({ text: 'Downloading circuit and proving key ...' })

  const t0 = performance.now()

  const [cirDef, provingKey] = await Promise.all([
    fetchWithoutCache('http://localhost:5566/circuit')
      .then(res => res.json())
      .then(res => res),
    fetchWithoutCache('http://localhost:5566/provingKey')
      .then(res => res.arrayBuffer())
      .then(res => new Uint8Array(res))
  ])

  const downloadTime = ((performance.now() - t0) / 1000).toFixed(2)

  progressCallback({
    text: `
    Circuit and proving key downloaded (${downloadTime} s).
    Generating Witness ...`
  })

  const circuit = genCircuit(cirDef)
  const leaves = await contract.getIdentityCommitments()

  const externalNullifier = genExternalNullifier(externalNullifierStr)

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
