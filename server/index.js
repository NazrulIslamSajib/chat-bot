
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = {};

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('createRoom', () => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    rooms[roomCode] = [];
    socket.emit('roomCreated', roomCode);
  });

  socket.on('joinRoom', (roomCode) => {
    if (rooms[roomCode]) {
      socket.join(roomCode);
      rooms[roomCode].push(socket.id);
      socket.emit('joinedRoom', roomCode);
      io.to(roomCode).emit('userJoined', socket.id);
    } else {
      socket.emit('error', 'Room not found');
    }
  });

  socket.on('sendMessage', ({ roomCode, message, user }) => {
    io.to(roomCode).emit('message', { user, message, timestamp: new Date() });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    for (const roomCode in rooms) {
      const index = rooms[roomCode].indexOf(socket.id);
      if (index !== -1) {
        rooms[roomCode].splice(index, 1);
        io.to(roomCode).emit('userLeft', socket.id);
        break;
      }
    }
  });
});

module.exports = server;
