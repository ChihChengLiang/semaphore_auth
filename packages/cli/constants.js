const envPaths = require('env-paths')
const path = require('path')

const packageJson = require('./package.json')

const paths = envPaths(packageJson.name)

module.exports = {
  ROOT_DIR: paths.data,
  CIRCUIT_PATH: path.join(paths.data, 'circuit.json'),
  PROVING_KEY_PATH: path.join(paths.data, 'proving_key.bin')
}
