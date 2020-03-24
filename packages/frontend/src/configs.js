import config from './exported-config.json'

export const supportedNetwork = config.frontend.supportedNetwork

export const supportedNetworkName = config.frontend.supportedNetworkName

export const proofOfBurnAddress = config.chain.contracts.proofOfBurn

export const circuitUrl = config.snarks.circuitUrl

export const provingKeyUrl = config.snarks.provingKeyUrl
