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
}

async function createSchema () {
  if (await knex.schema.hasTable('posts')) {
    return
  }

  await knex.schema.createTable('posts', table => {
    table.increments('id').primary()
    table.string('postBody')

    table.string('proof')

    table.string('root')
    table.string('nullifierHash')
    table.string('signalHash')
    table.string('externalNullifier')
    table.string('externalNullifierStr')

    table
      .dateTime('createdAt')
      .notNullable()
      .defaultTo(knex.fn.now())
  })
}

module.exports = { createSchema , Post}
