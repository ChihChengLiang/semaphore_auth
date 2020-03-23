exports.up = function (knex) {
  return knex.schema.createTable('posts', table => {
    table.increments('id').primary()
    table.string('postBody', 280) // Twitter magic number
    table
      .integer('semaphoreLogId')
      .unsigned()
      .notNullable()
    table
      .dateTime('createdAt')
      .notNullable()
      .defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('posts')
}
