exports.up = function (knex) {
  return knex.schema.createTable('semaphore_logs', table => {
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

exports.down = function (knex) {
  return knex.schema.dropTable('semaphore_logs')
}
