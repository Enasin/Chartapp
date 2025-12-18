// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // allow frontend to connect from anywhere
    methods: ["GET", "POST"]
  }
});

const users = {};

io.on('connection', socket => {
  console.log('New user connected:', socket.id);

  socket.on('new-user', name => {
    users[socket.id] = name;
    socket.broadcast.emit('user-connected', name);
  });

  socket.on('send-chat-message', message => {
    socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] });
  });

  socket.on('disconnect', () => {
    if(users[socket.id]) {
      socket.broadcast.emit('user-disconnected', users[socket.id]);
      delete users[socket.id];
    }
  });
});

// Optional: a simple route to test server
app.get('/', (req, res) => {
  res.send('Chat server is running!');
});

// Listen on Render port or 3000 locally
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
