(function () {
  var fs = require('fs'),
  _ = require('underscore'),
  redis = require('then-redis'),
  redisClient = redis.createClient(),
  redisKeyPrefix = 'four:boards:';

  function saveMove(line) {
    line = line.split(',');
    var key = _.initial(line).join('');
    return redisClient
    .set(redisKeyPrefix + key, _.last(line)[0])
    .then(function() {
      console.log('Set ' + key);
    });
  }

  fs.readFile('/Users/bbenson/workspace/four/tasks/connect-4.data', function (err, data) {
    if (err) {
      console.log(err);
      return;
    }

    _(data.toString().split('\n'))
    .each(saveMove);
  });
})();
