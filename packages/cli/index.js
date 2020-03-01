const { setupHandler } = require('./setup')


const prompts = require('prompts')


require('yargs')
  .usage('A forum using zeroknowledge authentication')
  .command('setup', 'Download verification keys etc ...', {}, setupHandler)
  .command('identity', 'Manage your identities')
  .command('view', 'View latest posts')
  .command('post', 'Post a new article').argv

// Setup

// Identity

// Build: Download verification keys etc ...

// Get posts ...

// Post a new article
