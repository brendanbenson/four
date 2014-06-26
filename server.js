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
    Four.findGame(room, function(game) {
      if (!game) {
        return;
      }

      game.addMove(data.playerGuid, data.columnIndex, function(move) {
        if(move) {
          io.sockets.in(socket.room).emit('move', move);
        }
      });
    });
  });

  socket.on('join', function (data) {
    var roomGuid = data.room;
    var playerGuid = data.playerGuid;

    Four.findGame(roomGuid, function(game) {
      if (!game) {
        Four.createGame(roomGuid, function(game) {
          game.joinPlayer(playerGuid, function(success) {
            if(success) {
              socket.leave(socket.room);
              socket.join(roomGuid);
              socket.room = roomGuid;

              io.sockets.in(roomGuid).emit('update', game.getState());
            }
          });
        });
      } else {
        game.joinPlayer(playerGuid, function(success) {
          if(success) {
            socket.leave(socket.room);
            socket.join(roomGuid);
            socket.room = roomGuid;

            io.sockets.in(roomGuid).emit('update', game.getState());
          }
        });
      }
    });
  });
});
