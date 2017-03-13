const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

const index = fs.readFileSync(`${__dirname}/../client/client.html`);

const onRequest = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const app = http.createServer(onRequest).listen(PORT);
console.log(`Listening on port 127.0.0.1: ${PORT}`);

// pass http server to socketio and grab websocket server as io
const io = socketio(app);

let roomInt = 1;
let privateNum = 1;
let roomNum = 1;
let roomName;
const onJoined = (sock) => {
  const socket = sock;
  socket.on('join', (data) => {
    console.log(`Data: ${data}`);
    
    if (data === '') {
      roomName = `room${roomNum}`;
      if (roomInt % 2 === 0) {
        roomNum++;
      }
      roomInt++;
    }else if(data === 'private'){
      roomName = `private${privateNum}`;
      privateNum++;
    }else {
      roomName = data;
    }
    console.log(`RoomName: ${roomName}`);
    socket.room = roomName;
    socket.join(roomName);
  });
};

const onUpdate = (sock) => {
  const socket = sock;
  socket.on('sandToServer', (data) => {
    // data.color = 'lightpink';
    socket.broadcast.to('room1').emit('broadcastSand', data);
  });
};

const onDisconnect = (sock) => {
  const socket = sock;
  socket.on('disconnect', () => {
    console.log(`disconnect called for socket in room ${socket.room}`);
    socket.leave(socket.room);
  });
};

io.sockets.on('connection', (socket) => {
  onJoined(socket);
  onUpdate(socket);
  onDisconnect(socket);
});

console.log('Websocket server started');
