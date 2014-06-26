var expect = require('expect.js');
var io = require('socket.io-client');
var Four = require('../../../server/four');

var socketURL = 'http://0.0.0.0:3700';

var options = {
  transports: ['websocket'],
  forceNew: true
};

describe("connect four socket server", function () {
  var fakeId = function () {
    return (Math.random() + 1).toString(36).substring(2, 7);
  };

  describe('join', function () {
    it('joins a user to a room', function (done) {
      var client, clientId, room;

      client = io.connect(socketURL, options);
      clientId = fakeId();
      room = fakeId();

      client.on('connect', function () {
        client.emit('join', {room: room, playerGuid: clientId});
      });

      client.on('update', function (data) {
        client.disconnect();

        expect(data.board).to.eql([
          [null, null, null, null, null, null],
          [null, null, null, null, null, null],
          [null, null, null, null, null, null],
          [null, null, null, null, null, null],
          [null, null, null, null, null, null],
          [null, null, null, null, null, null],
          [null, null, null, null, null, null]
        ]);
        expect(data.currentPlayer).to.eql('1');
        expect(data.players[clientId]).to.eql('1');
        done();
      });
    });

    it('joins a second user to a room as a red player', function (done) {
      var client, clientId, room;

      client = io.connect(socketURL, options);
      clientId = fakeId();
      room = fakeId();

      client.on('connect', function (data) {
        client.emit('join', {room: room, playerGuid: clientId});
      });

      client.on('update', function () {
        client.disconnect();

        var secondClient = io.connect(socketURL, options),
          secondClientId = fakeId();

        secondClient.on('connect', function (data) {
          secondClient.emit('join', {room: room, playerGuid: secondClientId});
        });

        secondClient.on('update', function (data) {
          secondClient.disconnect();
          expect(data.players[clientId]).to.eql('1');
          expect(data.players[secondClientId]).to.eql('2');
          done();
        });
      });
    });
  });

  describe('move', function () {
    it('puts a move on the board', function (done) {
      var client, clientId, room;

      client = io.connect(socketURL, options);
      clientId = fakeId();
      room = fakeId();

      client.on('connect', function (data) {
        client.emit('join', {room: room, playerGuid: clientId});
      });

      client.on('update', function(data) {
        client.emit('move', {columnIndex: 0, playerGuid: clientId});
      });

      client.on('move', function (data) {
        client.disconnect();
        expect(data).to.eql({player: '1', columnIndex: 0, rowIndex: 0});
        done();
      });
    });
  });
});
