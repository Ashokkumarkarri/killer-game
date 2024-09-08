const socket = io();

document.getElementById('addPlayerButton').addEventListener('click', () => {
    const playerName = document.getElementById('playerName').value;
    if (playerName) {
        socket.emit('addPlayer', playerName);
    }
});

document.getElementById('startGameButton').addEventListener('click', () => {
    socket.emit('startGame');
});

socket.on('playerList', (players) => {
    const playerListDiv = document.getElementById('playerList');
    playerListDiv.innerHTML = '<h2>Players:</h2>';
    players.forEach(player => {
        playerListDiv.innerHTML += `<p>${player.name}</p>`;
    });
});

socket.on('gameStarted', (imposterId) => {
    const gameStatusDiv = document.getElementById('gameStatus');
    const voteSection = document.getElementById('voteSection');
    if (socket.id === imposterId) {
        gameStatusDiv.innerHTML = '<p>You are the imposter!</p>';
    } else {
        gameStatusDiv.innerHTML = '<p>The game has started. Discuss and vote!</p>';
        voteSection.style.display = 'block';
    }
});

socket.on('vote', (votes) => {
    const voteList = document.getElementById('voteList');
    voteList.innerHTML = '';
    const playerVotes = Object.entries(votes);
    playerVotes.forEach(([playerId, voteCount]) => {
        if (playerId !== socket.id) { // Exclude the current player from voting
            voteList.innerHTML += `<button onclick="vote('${playerId}')">Vote for ${playerId} (${voteCount} votes)</button>`;
        }
    });
});

function vote(votedPlayerId) {
    socket.emit('vote', votedPlayerId);
}
