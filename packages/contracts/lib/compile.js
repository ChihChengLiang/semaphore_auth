const solc = require('solc')
const fs = require('fs')
const path = require('path')

const fetch = require('node-fetch')

const SOLC_VERSION = 'v0.5.15+commit.6a57276f'
const SOLC_CACHE_PATH = path.join(__dirname, '../cache/soljson.js')
const CONTRACT_DIRS = ['../contracts/', '../semaphore/semaphorejs/contracts/']

const downloadSolc = async version => {
  console.log(`Fetching soljson-${version}.js`)
  return fetch(
    `https://raw.githubusercontent.com/ethereum/solc-bin/gh-pages/bin/soljson-${version}.js`
  ).then(res => {
    const dest = fs.createWriteStream(SOLC_CACHE_PATH)
    res.body.pipe(dest)
    return new Promise(function (resolve, reject) {
      res.body.on('end', resolve)
      res.body.on('error', reject)
    })
  })
}

const loadSolc = async version => {
  if (!fs.existsSync(SOLC_CACHE_PATH)) {
    console.log('Solc not found, downloading')
    await downloadSolc(version)
  }
  return solc.setupMethods(require(SOLC_CACHE_PATH))
}

const loadSources = async contractDirs => {
  const sources = {}
  for (const dirPath of contractDirs) {
    const dirAbsolutePath = path.join(__dirname, dirPath)
    const sols = fs.readdirSync(dirAbsolutePath)
    for (const filename of sols) {
      const content = fs
        .readFileSync(path.join(dirAbsolutePath, filename))
        .toString()
      sources[filename] = { content }
    }
  }
  return sources
}

const compileContracts = async () => {
  const mySolc = await loadSolc(SOLC_VERSION)
  const sources = await loadSources(CONTRACT_DIRS)
  const input = {
    language: 'Solidity',
    sources,
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  }
  function findImports (solPath) {
    const basename = path.basename(solPath)
    return { contents: sources[basename].content }
  }

  const output = JSON.parse(
    mySolc.compile(JSON.stringify(input), { import: findImports })
  )
  return output.contracts
}

module.exports = { compileContracts }
