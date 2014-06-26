var expect = require('expect.js');
var Board = require('../../../server/board');

describe('Four', function () {
  describe('.determineWinner', function () {
    it('returns the winner when there is a vertical win', function () {
      var board = [
        ['1', '1', '1', '1', null, null],
        ['2', '2', '2', null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null]
      ];

      var winner = Board.determineWinner(board, '1', 3, 0);

      expect(winner).to.be('1');
    });

    it('sets winner when there is a horizontal win', function () {
      var board = [
        [null, null, null, null, null, null],
        ['1', null, null, null, null, null],
        ['1', null, null, null, null, null],
        ['1', null, null, null, null, null],
        ['1', null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null]
      ];

      var winner = Board.determineWinner(board, '1', 0, 2);

      expect(winner).to.be('1');
    });

    it('sets winner when there is a diagonal up right win', function () {
      var board = [
        [null, null, null, null, null, null],
        ['1', null, null, null, null, null],
        ['1', '1', null, null, null, null],
        ['1', '2', '1', null, null, null],
        ['2', '2', '2', '1', null, null],
        ['2', null, null, null, null, null],
        [null, null, null, null, null, null]
      ];

      var winner = Board.determineWinner(board, '1', 2, 3);

      expect(winner).to.be('1');
    });

    it('sets winner when there is a diagonal up left win', function () {
      var board = [
        ['2', '1', '2', '1', null, null],
        ['1', '1', '1', null, null, null],
        ['1', '1', null, null, null, null],
        ['1', '2', null, null, null, null],
        ['2', '2', '2', '1', null, null],
        ['2', '2', null, null, null, null],
        [null, null, null, null, null, null]
      ];

      var winner = Board.determineWinner(board, '1', 2, 1);

      expect(winner).to.be('1');
    });
  });
});