
exports.up = function(knex) {
  return knex.schema.createTable('posts', table => {
    table.increments('id').primary()
    table.string('postBody')
    table.integer('semaphoreLogId')
    table
      .dateTime('createdAt')
      .notNullable()
      .defaultTo(knex.fn.now())
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('posts');
};
