const { createApp, bindDb } = require('./src/app')

const main = async () => {
  await bindDb()

  const app = createApp()
  app.listen(5566, () => {
    console.log('Backend listening in 5566')
  })
}

if (require.main === module) {
  main()
}
