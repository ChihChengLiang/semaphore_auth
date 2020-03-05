const { hostInfo } = require('./config')
const fetch = require('node-fetch')

const setServerHandler = async argv => {
  //TODO: Better validation
  if (!argv.hostUrl.includes('http')) throw new Error('please add http')
  const hostUrl = new URL(argv.hostUrl)

  const registrationInfo = await fetch(new URL('./info', hostUrl)).then(
    response => response.json()
  )

  registrationInfo.hostUrl = hostUrl.toString()
  console.info('Set the default server and registration info to')
  console.log(registrationInfo)
  hostInfo.set(registrationInfo)
}
module.exports = { setServerHandler }
