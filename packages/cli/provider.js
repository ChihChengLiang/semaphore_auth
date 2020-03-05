const ethers = require('ethers')
const { hostInfo } = require('./config')

const getProvider = () => {
  const network = hostInfo.get().network
  if (network === 'localhost') {
    return new ethers.providers.JsonRpcProvider()
  } else {
    return new ethers.getDefaultProvider(network)
  }
}

module.exports = { getProvider }
