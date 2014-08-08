(function () {
  var redis = require('then-redis'),
  redisClient = redis.createClient(),
  redisKeyPrefix = 'four:games:';

  var redisKey = function (id) {
    return redisKeyPrefix + id;
  };

  module.exports = {
    save: function (id, state) {
      return redisClient.set(redisKey(id), JSON.stringify(state));
    },
    saveUnlessExists: function(id, state) {
      return redisClient.setnx(redisKey(id), JSON.stringify(state));
    },
    get: function(id) {
      return redisClient.get(redisKey(id));
    }
  };
})();