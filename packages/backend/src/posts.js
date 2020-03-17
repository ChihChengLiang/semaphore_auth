const posts = require('express').Router()
const { requireSemaphoreAuth } = require('./authentication')
const { Post } = require('./schema')

const PAGESIZE = 20

posts.get('/', async (req, res) => {
  // {
  //   results: [{Post}]
  //   total: int
  // }
  const result = await Post.query()
    .orderBy('id', 'desc')
    .page(0, PAGESIZE)
  res.json(result)
})

posts.get('/page/:pageNum', async (req, res) => {
  const pageNum = parseInt(req.params.pageNum)
  const result = await Post.query()
    .leftJoinRelated('authData')
    .select('authData.*')
    .select('posts.*')
    .orderBy('posts.id', 'desc')
    .page(pageNum, PAGESIZE)
  result.next = (pageNum + 1) * PAGESIZE < result.total ? pageNum + 1 : null
  res.json(result)
})

posts.get('/:postId', async (req, res) => {
  const postId = req.params.postId
  const post = await Post.query().findOne({ id: postId })
  res.json(post)
})

posts.post('/new', requireSemaphoreAuth, async (req, res, next) => {
  const postBody = req.body.postBody
  const semaphoreLogId = req.semaphoreLogId
  const post = await Post.query()
    .insert({ postBody, semaphoreLogId })
    .catch(next)
  res.json({
    message: `Your article is published! Article id: ${post.id}`,
    postId: post.id
  })
})

module.exports = { posts }
