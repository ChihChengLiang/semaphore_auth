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
  progressCallback({ text: 'Downloading circuit and proving key' })

  const [cirDef, provingKey] = await Promise.all([
    fetchWithoutCache('http://localhost:5566/circuit')
      .then(res => res.json())
      .then(res => res),
    fetchWithoutCache('http://localhost:5566/provingKey')
      .then(res => res.arrayBuffer())
      .then(res => new Uint8Array(res))
  ])

  progressCallback({ text: 'Circuit and proving key downloaded' })

  const circuit = genCircuit(cirDef)
  const leaves = await contract.getIdentityCommitments()

  const externalNullifier = genExternalNullifier(externalNullifierStr)

  progressCallback({ text: 'Generating Witness' })

  const { witness } = await genWitness(
    signalStr,
    circuit,
    identity,
    leaves,
    SEMAPHORE_TREE_DEPTH,
    externalNullifier
  )

  progressCallback({ text: 'Generating proof and public signals' })

  const proof = await genProof(witness, provingKey)
  const publicSignals = genPublicSignals(witness, circuit)

  const requestData = {
    proof: JSON.stringify(stringifyBigInts(proof)),
    publicSignals: JSON.stringify(stringifyBigInts(publicSignals))
  }
  return requestData
}

export default genAuth
