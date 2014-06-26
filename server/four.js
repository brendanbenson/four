(function () {
  var Board = require('./board'),
  Q = require('q'),
  redis = require('then-redis'),
  redisClient = redis.createClient(),
  redisKeyPrefix = 'four:games:';

  var games = {};

  var blankGame = {
    board: [
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null]
    ],
    players: {},
    currentPlayer: '1'
  };

  var Four = function (state, id) {
    this.state = state;
    this.id = id;
  };

  Four.findGame = function (gameId) {
    var deferred = Q.defer();

    redisClient.get(redisKeyPrefix + gameId)
    .then(function (obj) {
      if (obj === null) {
        deferred.reject();
      } else {
        deferred.resolve(new Four(JSON.parse(obj), gameId));
      }
    });

    return deferred.promise;
  };

  Four.createGame = function (gameId) {
    var deferred = Q.defer();

    var stringGame = JSON.stringify(blankGame);

    redisClient.setnx(redisKeyPrefix + gameId, stringGame)
    .then(function (obj) {
      if (obj === 1) {
        var newGame = JSON.parse(stringGame);
        deferred.resolve(new Four(newGame, gameId));
      } else {
        return redisClient.get(redisKeyPrefix + gameId);
      }
    })
    .then(function (obj) {
      deferred.resolve(new Four(JSON.parse(obj), gameId));
    });

    return deferred.promise;
  };

  Four.prototype.getState = function () {
    return this.state;
  };

  Four.prototype.joinPlayer = function (playerId) {
    var deferred = Q.defer();

    var players = this.getState().players;

    if (players[playerId] !== undefined) {
      // Already joined
      deferred.resolve();
    } else if (Object.keys(players).length == 0) {
      // First player
      players[playerId] = '1';
      this.save_().then(deferred.resolve);
    } else if (Object.keys(players).length == 1) {
      // Second player
      players[playerId] = '2';
      this.save_().then(deferred.resolve);
    } else {
      // Full game
      deferred.reject();
    }

    return deferred.promise;
  };

  Four.prototype.addMove = function (playerId, columnIndex, callback) {
    var deferred = Q.defer();

    var state = this.getState();
    var board = state.board;
    var player = state.players[playerId];
    var currentPlayer = state.currentPlayer;
    var winner = state.winner;

    var rowIndex = board[columnIndex].indexOf(null);
    if (player === currentPlayer && winner === undefined && rowIndex != -1) {
      board[columnIndex][rowIndex] = player;
      state.currentPlayer = currentPlayer === '1' ? '2' : '1';
      state.winner = Board.determineWinner(board, player, rowIndex, columnIndex);
      this.save_().
      then(function () {
        deferred.resolve({
          player: player,
          rowIndex: rowIndex,
          columnIndex: columnIndex,
          winner: state.winner
        });
      });
    } else {
      deferred.reject();
    }

    return deferred.promise;
  };

  Four.prototype.save_ = function () {
    return redisClient.set(redisKeyPrefix + this.id, JSON.stringify(this.state));
  };

  module.exports = Four;
})();
