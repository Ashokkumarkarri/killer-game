const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const players = [];
let gameStarted = false;
let imposter = null;
let votes = {};

io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Handle new player joining
  socket.on('addPlayer', (playerName) => {
    if (players.length < 10 && !gameStarted) {
      players.push({ name: playerName, id: socket.id });
      io.emit('playerList', players);
      console.log(`${playerName} added`);
    }
  });

  // Handle game start
  socket.on('startGame', () => {
    if (players.length > 1) {
      gameStarted = true;
      const randomIndex = Math.floor(Math.random() * players.length);
      imposter = players[randomIndex].id;
      io.emit('gameStarted', imposter);
    }
  });

  // Handle vote
  socket.on('vote', (votedPlayerId) => {
    if (!votes[votedPlayerId]) {
      votes[votedPlayerId] = 0;
    }
    votes[votedPlayerId]++;
    io.emit('vote', votes);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
    const index = players.findIndex(player => player.id === socket.id);
    if (index !== -1) {
      players.splice(index, 1);
      io.emit('playerList', players);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
