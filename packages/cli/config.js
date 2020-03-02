const Configstore = require('configstore')
const packageJson = require('./package.json')

class Config {
  constructor (key) {
    this.configstore = new Configstore(packageJson.name)
    this.key = key
  }

  get () {
    return this.configstore.get(this.key)
  }
  set (value) {
    return this.configstore.set(this.key, value)
  }
}

const defaultIdentityName = new Config('defaultIdentityName')

module.exports = { defaultIdentityName }
