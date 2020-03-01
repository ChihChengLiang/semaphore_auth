const { ROOT_DIR, CIRCUIT_PATH, PROVING_KEY_PATH } = require('./constants')
const {
  CIRCUIT_URL,
  PROVING_KEY_URL
} = require('semaphore-auth-contracts/constants')
const fs = require('fs')

const ora = require('ora')

const fetch = require('node-fetch')

const download = async (fromURL, toPath) => {
  return fetch(fromURL).then(res => {
    const dest = fs.createWriteStream(toPath)
    res.body.pipe(dest)
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

    await download(fromURL, toPath)

    spinner.succeed(`Downloaded ${name} to ${toPath}`)
  }
}

const setupHandler = async argv => {
  console.log('Setting up')
  if (!fs.existsSync(ROOT_DIR)) fs.mkdirSync(ROOT_DIR)
  await checkMaybeDownload('Circuit', CIRCUIT_URL, CIRCUIT_PATH)
  await checkMaybeDownload('Proving key', PROVING_KEY_URL, PROVING_KEY_PATH)
}

module.exports = { setupHandler }
