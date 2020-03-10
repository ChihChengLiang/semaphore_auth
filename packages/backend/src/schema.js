const { Model } = require('objection')

const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './mydb.sqlite'
  }
})

Model.knex(knex)

class Post extends Model {
  static get tableName () {
    return 'posts'
  }
  static get relationMappings () {
    return {
      authData: {
        relation: Model.HasOneRelation,
        modelClass: SemaphoreLog,
        join: {
          from: 'posts.semaphoreLogId',
          to: 'semaphore_log.id'
        }
      }
    }
  }
}
class SemaphoreLog extends Model {
  static get tableName () {
    return 'semaphore_log'
  }
}

async function createSchema () {
  if (await knex.schema.hasTable('posts')) {
    return
  }

  await knex.schema.createTable('posts', table => {
    table.increments('id').primary()
    table.string('postBody')
    table.integer('semaphoreLogId')
    table
      .dateTime('createdAt')
      .notNullable()
      .defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('semaphore_log', table => {
    table.increments('id').primary()
    table.string('root')
    table.string('nullifierHash')
    table.string('signalHash')
    table.string('externalNullifierStr')
    table.string('proof')

    table
      .dateTime('createdAt')
      .notNullable()
      .defaultTo(knex.fn.now())
  })
}

module.exports = { createSchema, Post, SemaphoreLog }
