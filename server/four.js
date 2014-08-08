(function () {
  var Board = require('./board'),
  FourRepository = require('./fourRepository'),
  Q = require('q');

  var blankGame = function() {
    return {
      board: Board.createBlankBoard(),
      players: {},
      currentPlayer: '1'
    }
  };

  var Four = function (state, id) {
    this.state = state;
    this.id = id;
  };

  Four.findGame = function (gameId) {
    var deferred = Q.defer();

    FourRepository.get(gameId)
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

    FourRepository.saveUnlessExists(gameId, blankGame())
    .then(function (obj) {
      if (obj === 1) {
        deferred.resolve(new Four(blankGame(), gameId));
      } else {
        return FourRepository.get(gameId);
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

      FourRepository.save(this.id, this.state)
      .then(deferred.resolve);
    } else if (Object.keys(players).length == 1) {
      // Second player
      players[playerId] = '2';

      FourRepository.save(this.id, this.state)
      .then(deferred.resolve);
    } else {
      // Full game
      deferred.reject();
    }

    return deferred.promise;
  };

  Four.prototype.addMove = function (playerId, columnIndex) {
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
      FourRepository.save(this.id, this.state).
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

  module.exports = Four;
})();
