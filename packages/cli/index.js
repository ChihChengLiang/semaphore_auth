#!/usr/bin/env node
const fs = require('fs')

const { setupHandler } = require('./setup')
const {
  createIdentityHandler,
  listIdentityHandler,
  registerIdentityHandler
} = require('./identities')
const { newPostHandler } = require('./posts')
const { ROOT_DIR, IDENTITIES_DIR } = require('./constants')

const initDirs = () => {
  for (dirs of [ROOT_DIR, IDENTITIES_DIR]) {
    if (!fs.existsSync(IDENTITIES_DIR)) fs.mkdirSync(IDENTITIES_DIR)
  }
}

initDirs()

require('yargs')
  .usage('A forum using zeroknowledge authentication')
  .command('setup', 'Download verification keys etc ...', {}, setupHandler)
  .command('identity', 'Manage your identities', yargs => {
    yargs
      .command('create', 'Create a new identity', createIdentityHandler)
      .command('list', 'List existing identities', listIdentityHandler)
      .command('register', 'List existing identities', registerIdentityHandler)
      .demandCommand()
  })
  .command('view', 'View latest posts')
  .command(
    'post [article]',
    'Post a new article',
    yargs => {
      yargs.positional('article', {
        describe: 'The relative path of a markdown file to post'
      })
    },
    newPostHandler
  )
  .demandCommand().argv

// Setup

// Identity

// Build: Download verification keys etc ...

// Get posts ...

// Post a new article
