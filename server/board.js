(function () {
  module.exports = ({
    createBlankBoard: function() {
      return [
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null]
      ];
    },
    determineWinner: function (board, player, rowIndex, columnIndex, tokenCount, directionVertical, directionHorizontal) {
      var winCount = 4;
      if (tokenCount === undefined) {
        var vertical = this.determineWinner(board, player, rowIndex, columnIndex, 0, -1, 0);
        var horizontal = this.determineWinner(board, player, rowIndex, columnIndex, 0, 0, -1) +
        this.determineWinner(board, player, rowIndex, columnIndex + 1, 0, 0, 1);
        var upRight = this.determineWinner(board, player, rowIndex, columnIndex, 0, 1, 1) +
        this.determineWinner(board, player, rowIndex - 1, columnIndex - 1, 0, -1, -1);
        var upLeft = this.determineWinner(board, player, rowIndex, columnIndex, 0, 1, -1) +
        this.determineWinner(board, player, rowIndex - 1, columnIndex + 1, 0, -1, 1);

        if (vertical >= winCount || horizontal >= winCount || upRight >= winCount || upLeft >= winCount) {
          return player;
        }
      } else if (board[columnIndex] && board[columnIndex][rowIndex] === player) {
        tokenCount = tokenCount + 1;
        rowIndex = rowIndex + directionVertical;
        columnIndex = columnIndex + directionHorizontal;
        return this.determineWinner(board, player, rowIndex, columnIndex, tokenCount, directionVertical, directionHorizontal);
      } else {
        return tokenCount;
      }
    }
  });
})();