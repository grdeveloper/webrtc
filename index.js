const app = require('express')();
const index = require('http').Server(app);
const io = require('socket.io')(index);

index.listen(8080);


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log('connected');

  socket.on('offer', function (data) {
    socket.emit('offer', data);
  });

  socket.on('answer', function (data) {
    socket.emit('answer', data);
  });

  socket.on('candidate', function (data) {
    socket.emit('candidate', data);
  });
});