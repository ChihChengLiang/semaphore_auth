const fs = require('fs')
const path = require('path')

const newPostHandler = argv => {
  const articlePath = argv.article
  const article = fs.readFileSync(path.join(process.cwd(), articlePath))
  console.info(article.toString())
}

module.exports = { newPostHandler }
