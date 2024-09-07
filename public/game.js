const socket = io();

// Join Room
document.getElementById('joinBtn').addEventListener('click', () => {
  const playerName = document.getElementById('playerName').value;
  if (playerName) {
    socket.emit('joinRoom', playerName);
    document.getElementById('joinRoom').style.display = 'none';
    document.getElementById('gameLobby').style.display = 'block';
  }
});

// Update Players List in the Lobby
socket.on('playersUpdate', players => {
  const playersListDiv = document.getElementById('playersList');
  playersListDiv.innerHTML = players.map(player => `<p>${player}</p>`).join('');
});

// Start Game
document.getElementById('startGameBtn').addEventListener('click', () => {
  socket.emit('startGame');
});

// Receive Game Start
socket.on('startGame', () => {
  document.getElementById('gameLobby').style.display = 'none';
  document.getElementById('chatSection').style.display = 'block';
  document.getElementById('votingSection').style.display = 'block';
  document.getElementById('imposterNotification').style.display = 'none';
  document.getElementById('gameResult').style.display = 'none';
});

// Imposter Notification
socket.on('youAreImposter', () => {
  document.getElementById('imposterNotification').style.display = 'block';
});

// Handle Chat
document.getElementById('sendMsgBtn').addEventListener('click', () => {
  const message = document.getElementById('messageInput').value;
  if (message) {
    socket.emit('chatMessage', message);
    document.getElementById('messageInput').value = '';
  }
});

socket.on('chatMessage', message => {
  const messagesDiv = document.getElementById('messages');
  messagesDiv.innerHTML += `<p>${message}</p>`;
  messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to bottom
});

// Handle Voting
socket.on('playersUpdate', players => {
  const voteButtonsDiv = document.getElementById('voteButtons');
  voteButtonsDiv.innerHTML = players.map(player => 
    `<button onclick="vote('${player}')">${player}</button>`
  ).join('');
});

function vote(votedPlayerName) {
  socket.emit('vote', votedPlayerName);
}

// Handle Votes
socket.on('votesUpdate', votes => {
  // Optionally update the vote counts in the UI
});

// Handle Game Results
socket.on('gameResult', result => {
  const resultMessage = document.getElementById('resultMessage');
  if (result.winner === 'imposter') {
    resultMessage.textContent = 'The Imposter was eliminated! The Imposter wins!';
  } else if (result.winner === 'innocent') {
    resultMessage.textContent = 'An innocent player was eliminated. The game continues!';
  } else {
    resultMessage.textContent = 'No clear result. The game continues!';
  }
  document.getElementById('gameResult').style.display = 'block';
  document.getElementById('chatSection').style.display = 'none';
  document.getElementById('votingSection').style.display = 'none';
});
