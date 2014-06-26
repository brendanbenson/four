(function () {
  var Board = require('./board');

  var redis = require("redis"),
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

  Four.findGame = function (gameId, callback) {
    redisClient.get(redisKeyPrefix + gameId, function(err, obj) {
      if(obj === null) {
        callback()
      } else {
        callback(new Four(JSON.parse(obj), gameId));
      }
    });
  };

  Four.createGame = function (gameId, callback) {
    var stringGame = JSON.stringify(blankGame);

    redisClient.setnx(redisKeyPrefix + gameId, stringGame, function(err, obj) {
      if(obj === 1) {
        var newGame = JSON.parse(stringGame);
        callback(new Four(newGame, gameId));
      } else {
        redisClient.get(redisKeyPrefix + gameId, function(err, obj) {
          callback(new Four(JSON.parse(obj), gameId));
        });
      }
    });
  };

  Four.prototype.getState = function () {
    return this.state;
  };

  Four.prototype.joinPlayer = function (playerId, callback) {
    var players = this.getState().players;
    if (players[playerId] !== undefined) {
      // Already joined
      callback(true);
    } else if (Object.keys(players).length == 0) {
      // First player
      players[playerId] = '1';
      this.save_(function() {
        callback(true);
      });
    } else if (Object.keys(players).length == 1) {
      // Second player
      players[playerId] = '2';
      this.save_(function() {
        callback(true);
      });
    } else {
      // Full game
      callback(false);
    }
  };

  Four.prototype.addMove = function (playerId, columnIndex, callback) {
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
      this.save_(function() {
        callback({player: player, rowIndex: rowIndex, columnIndex: columnIndex, winner: state.winner});
      });
    } else {
      callback();
    }
  };

  Four.prototype.save_ = function(callback) {
    redisClient.set(redisKeyPrefix + this.id, JSON.stringify(this.state), callback);
  };

  module.exports = Four;
})();
