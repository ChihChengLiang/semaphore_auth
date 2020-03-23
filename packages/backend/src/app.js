const express = require('express')
const { posts } = require('./posts')
const { groups } = require('./groups')
const Knex = require('knex')
const configs = require('./configs')
const { Model } = require('objection')

const bindDb = async () => {
  const knex = Knex(configs.db)
  Model.knex(knex)

  // Wait for the DB to be active
  await knex.raw('select 1+1 as result').catch(err => {
    console.error(err)
    process.exit(1)
  })

  return knex
}

const naiveErrorHandler = (err, req, res, next) => {
  console.error(err.stack)
  res.status(400).json({
    error: err.toString()
  })
}

const createApp = () => {
  const app = express()
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Routes
  app.use('/posts', posts)
  app.use('/info', groups)

  // Error handling
  app.use(naiveErrorHandler)

  return app
}

module.exports = { createApp, bindDb }
