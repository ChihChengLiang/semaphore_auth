class EpochbasedExternalNullifier {
  constructor (prefix, epochLength) {
    this.prefix = prefix
    this.epochLength = epochLength // In milliseconds
  }

  epochStart () {
    const now = new Date().valueOf()
    return now - (now % this.epochLength)
  }

  timeBeforeNextEpoch () {
    const now = new Date().valueOf()
    return this.epochLength - (now % this.epochLength)
  }

  getString () {
    return `${this.prefix}:${this.epochStart()}`
  }
}

module.exports = {
  EpochbasedExternalNullifier
}
