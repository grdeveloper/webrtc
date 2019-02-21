const app = require('express')();
const index = require('http').Server(app);
const io = require('socket.io')(index);

index.listen(8080);


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log('connected');
});