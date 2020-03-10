const { CIRCUIT_PATH, PROVING_KEY_PATH } = require('./constants')
const {
  CIRCUIT_URL,
  PROVING_KEY_URL
} = require('semaphore-auth-contracts/constants')
const fs = require('fs')

const ora = require('ora')

const fetch = require('node-fetch')

const { defaultIdentityName } = require('./config')
const { createIdentity } = require('./identities')

const download = async (fromURL, toPath, spinner, name) => {
  return fetch(fromURL).then(res => {
    const dest = fs.createWriteStream(toPath)
    const contentLength = res.headers.get('Content-Length')
    let progress = 0
    res.body.pipe(dest)
    res.body.on('data', chunk => {
      progress += chunk.length
      spinner.text = `Downloading ${name} ... ${parseInt(
        (progress / contentLength) * 100
      )}%`
    })
    return new Promise(function (resolve, reject) {
      res.body.on('end', resolve)
      res.body.on('error', reject)
    })
  })
}

const checkMaybeDownload = async (name, fromURL, toPath) => {
  if (fs.existsSync(toPath)) {
    console.info(`${name} exists, no need to download`)
  } else {
    const spinner = ora(`Downloading ${name}`).start()

    await download(fromURL, toPath, spinner, name)

    spinner.succeed(`Downloaded ${name} to ${toPath}`)
  }
}

const checkMaybeGenIdentity = () => {
  if (defaultIdentityName.get() === undefined) {
    console.info(
      "Oh, you don't have a default identity, let me get one for you"
    )
    const { filename } = createIdentity()
    defaultIdentityName.set(filename)
  }
}

const setupHandler = async argv => {
  console.log('Setting up')
  await checkMaybeDownload('Circuit', CIRCUIT_URL, CIRCUIT_PATH)
  await checkMaybeDownload('Proving key', PROVING_KEY_URL, PROVING_KEY_PATH)
  checkMaybeGenIdentity()
}

module.exports = { setupHandler }
