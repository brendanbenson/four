(function () {
  var Board = require('./board'),
  FourRepository = require('./fourRepository'),
  _ = require('underscore'),
  Q = require('q');

  var maxPlayers = 2;

  var blankGame = function() {
    return {
      board: Board.createBlankBoard(),
      players: [],
      currentPlayer: 0
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

  Four.prototype.joinPlayer = function (playerId) {
    var deferred = Q.defer(),
    players = this.state.players;

    if (_.findWhere(players, {id: playerId})) {
      deferred.resolve();
    } else if (players.length < maxPlayers) {
      players.push({
        id: playerId,
        playerNumber: players.length,
        gamesWon: 0
      });

      FourRepository.save(this.id, this.state).then(deferred.resolve);
    } else {
      deferred.reject();
    }

    return deferred.promise;
  };

  Four.prototype.addMove = function (playerId, columnIndex) {
    var deferred = Q.defer(),
    state = this.state,
    board = state.board,
    player = _.findWhere(state.players, {id: playerId}),
    currentPlayer = state.currentPlayer,
    winner = state.winner,
    rowIndex = board[columnIndex].indexOf(null);

    if (player.playerNumber == currentPlayer && winner == undefined && rowIndex != -1) {
      board[columnIndex][rowIndex] = player.playerNumber;
      state.currentPlayer = currentPlayer == 0 ? 1 : 0;
      state.winner = Board.determineWinner(board, player.playerNumber, rowIndex, columnIndex);
      if (state.winner != null) {
        state.players[state.winner].gamesWon += 1;
        state.currentPlayer = state.winner == 0 ? 1 : 0;
      }
      FourRepository.save(this.id, this.state).
      then(function () {
        deferred.resolve({
          player: player.playerNumber,
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

  Four.prototype.createNextGame = function() {
    var state = this.state,
    deferred = Q.defer(),
    game = this;

    if (state.winner != null) {
      state.winner = null;
      state.board = Board.createBlankBoard();
      FourRepository.save(this.id, this.state).
      then(function() {
        deferred.resolve(game);
      });
    } else {
      deferred.reject();
    }

    return deferred.promise;
  };

  module.exports = Four;
})();
