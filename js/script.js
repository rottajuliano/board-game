let diceImg=document.querySelector('#diceImg');
let soundAnimation=document.querySelector('#sound');
let drawBtn=document.querySelector('#gameBtn');

const answerButtons = [
    document.getElementById('answer1'),
    document.getElementById('answer2'),
    document.getElementById('answer3'),
    document.getElementById('answer4')
];

let players = [];
let currentPlayerIndex = 0;
let positions = [];
let currentRoll = 0;
let newPosition = 0;
const colors = ["red", "blue", "green", "brown", "purple", "orange", "pink", "yellow"];
const boardSize = 20;

const answeredQuestions = Array(boardSize).fill(false);

function initializeBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    for (let i = 0; i < boardSize; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.id = 'tile-' + i;
        tile.textContent = i + 1;
        board.appendChild(tile);
    }
}

function updateBoard() {
    // Clear all player markers
    document.querySelectorAll('.player-marker').forEach(marker => marker.remove());

    // Group players by tile
    const tilePlayers = positions.reduce((acc, pos, index) => {
        if (!acc[pos.current]) acc[pos.current] = [];
        acc[pos.current].push(index);
        return acc;
    }, {});

    // Add markers for each tile
    Object.entries(tilePlayers).forEach(([tileId, playerIndices]) => {
        const currentTile = document.getElementById('tile-' + tileId);

        if (currentTile) {
            playerIndices.forEach((playerIndex, markerOffset) => {
                const marker = document.createElement('div');
                marker.className = 'player-marker';
                marker.style.backgroundColor = players[playerIndex].color;
                marker.style.left = `${4 + (markerOffset * 10)}px`; // Spacing markers

                currentTile.appendChild(marker);
            });
        }
    });
}

function updatePlayerTurnLabel() {
    const playerTurnLabel = document.getElementById('player-turn');
    playerTurnLabel.innerHTML = `<span style="color: ${players[currentPlayerIndex].color};">${players[currentPlayerIndex].color}'s turn</span>`;
}

function showQuestionDialog(roll, questionData) {
    const overlay = document.querySelector('.overlay');
    const dialog = document.getElementById('question-dialog');
    const questionText = document.getElementById('question-text');

    // Set the question and answers
    questionText.innerHTML = `Player ${players[currentPlayerIndex].color} rolled a ${roll}.<br>Question: ${questionData.question}`;
    
    // Set answer options
    answerButtons.forEach((button, index) => {
        button.textContent = questionData.answers[index];
        button.onclick = () => handleAnswer(index, questionData.correctIndex);
    });

    overlay.style.display = 'block';
    dialog.style.display = 'block';
}

function handleAnswer(selectedIndex, correctIndex) {
    hideDialog();

    if (selectedIndex === correctIndex) {
        handleCorrectAnswer();
    } else {
        handleWrongAnswer();
    }
}

function hideDialog() {
    const overlay = document.querySelector('.overlay');
    const questionDialog = document.getElementById('question-dialog');
    questionDialog.style.display = 'none';
    overlay.style.display = 'none';
}

function hidePositionDialog() {
    const overlay = document.querySelector('.overlay');
    const positionDialog = document.getElementById('position-dialog');
    positionDialog.style.display = 'none';
    overlay.style.display = 'none';
}

function startGame() {
    const playerCount = parseInt(document.getElementById('playerCount').value);
    if (playerCount < 2 || playerCount > 8) {
        alert('Please enter a valid number of players (2-8).');
        return;
    }

    players = [];
    for (let i = 0; i < playerCount; i++) {
        players.push({ id: i, color: colors[i] });
    }

    positions = players.map(() => ({ previous: -1, current: 0 }));
    initializeBoard();
    updateBoard();

    currentPlayerIndex = 0;
    updatePlayerTurnLabel();

    document.getElementById('player-setup').classList.add('d-none');
    document.getElementById('game-area').classList.remove('d-none');
}

function rollDice() {
    diceImg.classList.add('diceAnimation');
    soundAnimation.play();

    setTimeout(function(){
        currentRoll = Math.floor(Math.random() * 6) + 1;
        diceImg.setAttribute('src', 'img/'+currentRoll+'.png');
        diceImg.classList.remove('diceAnimation');

        
        newPosition = positions[currentPlayerIndex].current + currentRoll;

        if (newPosition >= boardSize) {
            newPosition = boardSize - 1;
        }

        const question = questions[newPosition-1];
        if (question.question == "bonus") {
            positions[currentPlayerIndex].previous = newPosition;
            positions[currentPlayerIndex].current = newPosition;
            updateBoard();
            hideDialog();
            showPositionDialog(`Player ${players[currentPlayerIndex].color} got a bonus! Roll dice again.`);
        }
        else if (question.question == "trap") {
            positions[currentPlayerIndex].previous = -1;
            positions[currentPlayerIndex].current = 0;
            updateBoard();
            hideDialog();
            showPositionDialog(`Player ${players[currentPlayerIndex].color} fell into a trap! Go back to start.`);
            currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
            updatePlayerTurnLabel();
        } else {
            if (answeredQuestions[newPosition]) {
                // No question if it was already answered
                handleCorrectAnswer(true);
            } else {
                showQuestionDialog(currentRoll, question);
            }
        }
    },1750)
}

function showPositionDialog(message) {
    const overlay = document.querySelector('.overlay');
    const positionDialog = document.getElementById('position-dialog');
    document.getElementById('position-text').innerHTML = message; // Use innerHTML to include HTML tags
    overlay.style.display = 'block';
    positionDialog.style.display = 'block';
}

function handleCorrectAnswer(alreadyAnswered = false) {
    if (!alreadyAnswered) {
        answeredQuestions[newPosition] = true;
    }

    positions[currentPlayerIndex].previous = newPosition;
    positions[currentPlayerIndex].current = newPosition;
    updateBoard();
    hideDialog();
    if (newPosition >= 19) {
        showPositionDialog(`Player ${players[currentPlayerIndex].color} wis!`);
    }
    else if (alreadyAnswered) {
        showPositionDialog(`Already answered! Player ${players[currentPlayerIndex].color} moves to position ${newPosition + 1}.`);
    } else {
        showPositionDialog(`Correct!<br>Player ${players[currentPlayerIndex].color} moves to position ${newPosition + 1}.`);
    }
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updatePlayerTurnLabel();
}

function handleWrongAnswer() {
    hideDialog();
    showPositionDialog(`Wrong!<br>Player ${players[currentPlayerIndex].color} stays at position ${positions[currentPlayerIndex].previous + 1}.`);
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updatePlayerTurnLabel();
}
document.getElementById('startGame').addEventListener('click', startGame);
document.getElementById('rollDice').addEventListener('click', rollDice);
document.getElementById('skipTurn').addEventListener('click', () => {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updatePlayerTurnLabel();
});
document.getElementById('closePositionDialog').addEventListener('click', hidePositionDialog);