if (!process.env.hasOwnProperty('NODE_CONFIG_DIR')) {
  process.env.NODE_CONFIG_DIR = __dirname
}

if (!process.env.hasOwnProperty('NODE_ENV')) {
  process.env.NODE_ENV = 'local-dev'
}

const config = require('config')

module.exports = config
