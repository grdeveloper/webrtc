const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = 3000;

app.use('/', express.static('./build', {index: 'index.html'}));

io.on('connection', (client) => {
    console.log('connected');

    client.on('offer', sdp => client.broadcast.emit('offered', sdp));

    client.on('answer', sdp => client.broadcast.emit('answered', sdp));

    client.on('candidate', candidate => client.broadcast.emit('candidated', candidate));

    client.on('hangup', () => io.emit('hangup'));
});

http.listen(3000, () => {console.log(`Running on port ${port}`);});