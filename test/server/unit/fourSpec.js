var expect = require('expect.js');
var Four = require('../../../server/four');
var Board = require('../../../server/board');
var sinon = require('sinon');
var redis = require('then-redis'),
redisClient = redis.createClient();

describe('Four', function () {
  beforeEach(function (done) {
    redisClient.flushdb().then(function () {
      done();
    });
  });

  describe('.createGame', function () {
    it('creates a blank game', function (done) {
      Four.createGame('fakeId')
      .then(function (four) {
        expect(four).to.be.a(Four);
        return redisClient.get('four:games:fakeId')
      })
      .then(function (obj) {
        expect(obj).not.to.be(null);
        done();
      });
    });

    it('uses an existing game if a game with that id already exists', function (done) {
      redisClient.set('four:games:existing', JSON.stringify({fake: 'game'}))
      .then(function () {
        return Four.createGame('existing');
      })
      .then(function (game) {
        expect(game.getState()).to.eql({fake: 'game'});
        done();
      });
    });
  });

  describe('.findGame', function () {
    it('finds a game', function (done) {
      redisClient.set('four:games:existing', JSON.stringify({fake: 'game'}))
      .then(function () {
        return Four.findGame('existing')
      })
      .then(function (four) {
        expect(four).to.be.a(Four);
        done();
      });
    });

    it('rejects the promise if no game is found', function (done) {
      Four.findGame('nonexistent')
      .fail(function () {
        done();
      });
    });
  });

  describe('instance methods', function () {
    var four;

    beforeEach(function (done) {
      Four.createGame('game')
      .then(function (game) {
        four = game;
        done();
      });
    });

    describe('#getState', function () {
      it('gets the current state', function () {
        expect(four.getState()).to.eql(
        {
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
        }
        );
      });
    });

    describe('#joinPlayer', function () {
      it('joins a player to a game and resolves the promise', function (done) {
        four.joinPlayer('fakePlayer')
        .then(function () {
          expect(four.getState().players.fakePlayer).to.be('1');
          return Four.findGame('game')
        }).then(function (game) {
          expect(game.getState().players.fakePlayer).to.be('1');
          done();
        });
      });

      it('joins an existing player to a game', function (done) {
        four.joinPlayer('fakePlayer')
        .then(function () {
          expect(four.getState().players.fakePlayer).to.be('1');
          return four.joinPlayer('fakePlayer');
        })
        .then(function () {
          expect(four.getState().players.fakePlayer).to.be('1');
          return Four.findGame('game');
        })
        .then(function (game) {
          expect(game.getState().players.fakePlayer).to.be('1');
          done();
        });
      });

      it('joins a second player to a game and returns true', function (done) {
        four.joinPlayer('player1')
        .then(function () {
          return four.joinPlayer('player2');
        })
        .then(function () {
          return Four.findGame('game');
        })
        .then(function (game) {
          expect(game.getState().players.player1).to.be('1');
          expect(game.getState().players.player2).to.be('2');
          done();
        });
      });

      it('returns false if there are already two players joined', function (done) {
        four.joinPlayer('player1')
        .then(function () {
          return four.joinPlayer('player2');
        })
        .then(function () {
          return four.joinPlayer('player3');
        })
        .fail(function () {
          done();
        });
      });
    });

    describe('#addMove', function () {
      it('adds a coin to the board and returns the move', function (done) {
        four.joinPlayer('player1')
        .then(function () {
          return four.addMove('player1', 0);
        })
        .then(function (move) {
          expect(move).to.eql({player: true, rowIndex: 0, columnIndex: 0, winner: undefined});
          return Four.findGame('game');
        }).then(function (game) {
          expect(game.getState().board[0][0]).to.be('1');
          done();
        });
      });

      it('adds another coin to the board', function (done) {
        four.joinPlayer('player1')
        .then(function () {
          return four.joinPlayer('player2');
        })
        .then(function () {
          return four.addMove('player1', 0)
        })
        .then(function () {
          return four.addMove('player2', 0);
        })
        .then(function () {
          return Four.findGame('game');
        })
        .then(function (game) {
          expect(game.getState().board[0][0]).to.be('1');
          expect(game.getState().board[0][1]).to.be('2');
          done();
        });
      });

      it('prevents a player from playing twice in a row', function (done) {
        four.joinPlayer('player1')
        .then(function () {
          return four.addMove('player1', 0);
        })
        .then(function () {
          return four.addMove('player1', 0);
        })
        .fail(function () {
          return Four.findGame('game');
        })
        .then(function (game) {
          expect(game.getState().board[0][0]).to.be('1');
          expect(game.getState().board[0][1]).to.be(null);
          done();
        });
      });

      it('fails when adding a coin to a full row', function (done) {
        four.getState().board = [
          ['1', '2', '1', '2', '1', '2'],
          [true, null, null, null, null, null],
          [null, null, null, null, null, null],
          [null, null, null, null, null, null],
          [null, null, null, null, null, null],
          [null, null, null, null, null, null],
          [null, null, null, null, null, null]
        ];

        four.save_()
        .then(function () {
          return four.joinPlayer('player1')
          .then(function () {
            return four.addMove('player1', 0);
          })
          .fail(function () {
            done();
          });
        });
      });

      it('yields winner as undefined when there is no winner', function (done) {
        four.joinPlayer('player1')
        .then(function () {
          return four.addMove('player1', 0);
        })
        .then(function (move) {
          expect(move.winner).to.be(undefined);
          done();
        });
      });

      it('yields winner when there is a win', function (done) {
        Board.determineWinner = sinon.stub().returns('1');

        four.joinPlayer('player1')
        .then(function() {
          return four.addMove('player1', 0);
        })
        .then(function(move) {
          expect(move.winner).to.be('1');
          done();
        });
      });

      it('forbids moves on a finished game', function (done) {
        four.getState().winner = '1';

        four.save_()
        .then(function() {
          return four.joinPlayer('player1');
        })
        .then(function() {
          return four.addMove('player1', 1);
        })
        .then(null, function() {
          done();
        });
      });
    });
  });
});
