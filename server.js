const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = [];
let imposter = null;
let votes = {};
let gameStarted = false;
let votingTimeout;

// Serve static files from the 'public' directory
app.use(express.static('public'));

io.on('connection', socket => {
  console.log('A player connected: ', socket.id);

  // Join Room
  socket.on('joinRoom', playerName => {
    players.push({ id: socket.id, name: playerName });
    io.emit('playersUpdate', players.map(p => p.name));
    console.log(`${playerName} joined the room`);
  });

  // Start Game
  socket.on('startGame', () => {
    if (players.length > 1) {
      if (gameStarted) return; // Prevent starting multiple games
      gameStarted = true;
      imposter = players[Math.floor(Math.random() * players.length)];
      io.to(imposter.id).emit('youAreImposter');
      io.emit('startGame');
      console.log('Game started. Imposter is:', imposter.name);
      votes = {}; // Reset votes
      startVotingTimeout();
    } else {
      socket.emit('errorMessage', 'At least 2 players are required to start the game.');
    }
  });

  // Handle Chat
  socket.on('chatMessage', message => {
    io.emit('chatMessage', message);
  });

  // Handle Voting
  socket.on('vote', votedPlayerName => {
    if (gameStarted) {
      if (!votes[votedPlayerName]) {
        votes[votedPlayerName] = 1;
      } else {
        votes[votedPlayerName]++;
      }
      io.emit('votesUpdate', votes);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    players = players.filter(p => p.id !== socket.id);
    io.emit('playersUpdate', players.map(p => p.name));
    console.log('A player disconnected:', socket.id);
  });
});

function startVotingTimeout() {
  clearTimeout(votingTimeout);
  votingTimeout = setTimeout(() => {
    endVoting();
  }, 60000); // 60 seconds for voting
}

function endVoting() {
  const maxVotes = Math.max(...Object.values(votes));
  const votedPlayers = Object.keys(votes).filter(name => votes[name] === maxVotes);
  if (votedPlayers.length === 1) {
    const votedPlayer = votedPlayers[0];
    if (players.find(p => p.name === votedPlayer) === imposter) {
      io.emit('gameResult', { winner: 'imposter' });
    } else {
      io.emit('gameResult', { winner: 'innocent' });
    }
    resetGame();
  } else {
    io.emit('gameResult', { winner: 'continue' });
  }
}

function resetGame() {
  players = [];
  imposter = null;
  votes = {};
  gameStarted = false;
}

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
