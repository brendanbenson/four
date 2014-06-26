var express = require('express');
var Four = require('./server/four');
var app = express();
var port = 3700;

var io = require('socket.io').listen(app.listen(port));
console.log("Listening on port " + port);

app.set('views', __dirname + '/build');
app.engine('html', require('ejs').renderFile);

app.get("/", function (req, res) {
  res.render("index.html");
});

app.use(express.static(__dirname + '/build'));

io.sockets.on('connection', function (socket) {
  socket.on('move', function (data) {
    var room = socket.room;
    Four.findGame(room)
    .then(function (game) {
      return game.addMove(data.playerGuid, data.columnIndex);
    })
    .then(function (move) {
      io.sockets.in(socket.room).emit('move', move);
    });
  });

  socket.on('join', function (data) {
    var roomGuid = data.room,
    playerGuid = data.playerGuid,
    game;

    Four.findGame(roomGuid)
    .then(function (game) {
      game.joinPlayer(playerGuid)
      .then(function () {
        socket.leave(socket.room);
        socket.join(roomGuid);
        socket.room = roomGuid;

        io.sockets.in(roomGuid).emit('update', game.getState());
      });
    }, function () {
      Four.createGame(roomGuid)
      .then(function (createdGame) {
        game = createdGame;
        return createdGame.joinPlayer(playerGuid)
      })
      .then(function () {
        socket.leave(socket.room);
        socket.join(roomGuid);
        socket.room = roomGuid;

        io.sockets.in(roomGuid).emit('update', game.getState());
      });
    });
  });
});
