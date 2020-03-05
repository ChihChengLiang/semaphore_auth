#!/usr/bin/env node
const fs = require('fs')

const { setupHandler } = require('./setup')
const { setServerHandler } = require('./setServer')
const {
  createIdentityHandler,
  listIdentityHandler,
  setIdentityHandler,
  registerIdentityHandler
} = require('./identities')
const { newPostHandler, viewPostHandler } = require('./posts')
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
  .command(
    'setServer <hostUrl>',
    'Set the default server to interact',
    yargs => {
      yargs.positional('hostUrl', {
        describe: 'The server url to connect'
      })
    },
    setServerHandler
  )
  .command('identity', 'Manage your identities', yargs => {
    yargs
      .command('create', 'Create a new identity', createIdentityHandler)
      .command('list', 'List existing identities', listIdentityHandler)
      .command('set', 'Set default identity', setIdentityHandler)
      .command(
        'register',
        'Register the default identity',
        yargs => {
          yargs
            .option('print', {
              type: 'boolean',
              describe: 'just print out the transaction'
            })
            .option('local', {
              type: 'boolean',
              describe: 'Using ganache provider'
            })
        },
        registerIdentityHandler
      )
      .demandCommand()
  })
  .command('view', 'View latest posts', {}, viewPostHandler)
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
