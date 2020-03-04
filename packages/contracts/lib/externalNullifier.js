class EpochbasedExternalNullifier {
  constructor (serviceName, uri, epochLength) {
    this.serviceName = serviceName
    this.uri = uri
    this.epochLength = epochLength // In milliseconds
  }

  toString () {
    const now = new Date().valueOf()
    const epochStart = now - (now % this.epochLength)
    return `${this.serviceName}:${this.uri}:${epochStart}`
  }
}

module.exports = {
  EpochbasedExternalNullifier
}
