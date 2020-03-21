const { Model } = require('objection')

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
          to: 'semaphore_logs.id'
        }
      }
    }
  }
}
class SemaphoreLog extends Model {
  static get tableName () {
    return 'semaphore_logs'
  }
}

module.exports = { Post, SemaphoreLog }
