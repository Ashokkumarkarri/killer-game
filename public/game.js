const socket = io();

// Add player
document.getElementById('addPlayerButton').addEventListener('click', () => {
    const playerName = document.getElementById('playerName').value;
    if (playerName) {
        socket.emit('addPlayer', playerName);
        document.getElementById('playerName').value = '';
    }
});

// Start game
document.getElementById('startGameButton').addEventListener('click', () => {
    socket.emit('startGame');
});

// Update player list
socket.on('playerList', (players) => {
    const playerListContainer = document.getElementById('playerListContainer');
    playerListContainer.innerHTML = '';
    players.forEach(player => {
        const p = document.createElement('p');
        p.textContent = player.name;
        playerListContainer.appendChild(p);
    });
});

// Start game UI
socket.on('gameStarted', (imposterId) => {
    document.getElementById('gameStatus').textContent = 'Game started! Try to find the imposter!';
    document.getElementById('voteSection').style.display = 'block';
    document.getElementById('startGameButton').style.display = 'none';
});

// Update vote options
socket.on('updateVotes', (players) => {
    const voteList = document.getElementById('voteList');
    voteList.innerHTML = '';
    players.forEach(player => {
        const button = document.createElement('button');
        button.textContent = player.name;
        button.onclick = () => socket.emit('vote', player.id);
        voteList.appendChild(button);
    });
});

// Display result
socket.on('result', (data) => {
    if (data.eliminated) {
        document.getElementById('gameStatus').textContent = `Player with ID ${data.eliminated} was eliminated!`;
    } else {
        document.getElementById('gameStatus').textContent = `No one was eliminated. Continue discussing.`;
    }
});
