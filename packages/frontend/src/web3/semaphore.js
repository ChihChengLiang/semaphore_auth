import {
  genCircuit,
  genExternalNullifier,
  genWitness,
  genProof,
  genPublicSignals,
  stringifyBigInts
} from 'libsemaphore'

const fetchWithoutCache = url => fetch(url, { cache: 'no-store' })

const genProof = async (signalStr, identity) => {
  console.log('Downloading circuit')
  const cirDef = await (
    await fetchWithoutCache(config.snarkUrls.circuit)
  ).json() // Fetch no cache because the cached circuit is buggy

  const circuit = genCircuit(cirDef)
  const leaves = await contracts.ProofOfBurn.getLeaves()

  const externalNullifier = genExternalNullifier(`ANON${configs.HOST_NAME}`)

  const { witness } = await genWitness(
    signalStr,
    circuit,
    identity,
    leaves,
    configs.SEMAPHORE_TREE_DEPTH,
    externalNullifier
  )
  const provingKey = new Uint8Array(
    await (await fetch(config.snarkUrls.provingKey)).arrayBuffer()
  )
  const proof = await genProof(witness, provingKey)
  const publicSignals = genPublicSignals(witness, circuit)

  const requestData = {
    proof: JSON.stringify(stringifyBigInts(proof)),
    publicSignals: JSON.stringify(stringifyBigInts(publicSignals))
  }
  return requestData
}
