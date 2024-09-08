const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let players = [];
let gameStarted = false;
let imposterId = null;

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Add a new player
    socket.on('addPlayer', (playerName) => {
        if (!gameStarted) {
            const player = { id: socket.id, name: playerName };
            players.push(player);
            io.emit('playerList', players);
        }
    });

    // Start the game
    socket.on('startGame', () => {
        if (!gameStarted && players.length > 1) {
            gameStarted = true;
            // Randomly select an imposter
            imposterId = players[Math.floor(Math.random() * players.length)].id;
            io.emit('gameStarted', imposterId);
            io.emit('updateVotes', players);
        }
    });

    // Handle voting
    socket.on('vote', (votedPlayerId) => {
        if (gameStarted) {
            const votedPlayer = players.find(player => player.id === votedPlayerId);
            if (votedPlayer) {
                io.emit('result', { eliminated: votedPlayerId });
            }
        }
    });

    // Handle player disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        players = players.filter(player => player.id !== socket.id);
        io.emit('playerList', players);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
