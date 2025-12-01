const boardElement = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusMessage = document.getElementById('status-message');
const restartBtn = document.getElementById('restart-btn');
const playerScoreElement = document.getElementById('player-score');
const computerScoreElement = document.getElementById('computer-score');
const drawScoreElement = document.getElementById('draw-score');

let board = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let currentPlayer = 'X'; // X is user, O is computer
let scores = {
    player: 0,
    computer: 0,
    draw: 0
};

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const handleCellClick = (e) => {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (board[clickedCellIndex] !== '' || !gameActive || currentPlayer !== 'X') {
        return;
    }

    handlePlayerMove(clickedCell, clickedCellIndex);

    if (gameActive) {
        setTimeout(computerMove, 500); // Delay for realism
    }
};

const handlePlayerMove = (cell, index) => {
    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase(), 'taken');

    checkResult();

    if (gameActive) {
        currentPlayer = 'O';
        statusMessage.textContent = "Computer's Turn...";
    }
};

const computerMove = () => {
    if (!gameActive) return;

    // Simple AI: 1. Win, 2. Block, 3. Random
    let moveIndex = findBestMove('O'); // Try to win
    if (moveIndex === -1) moveIndex = findBestMove('X'); // Block player
    if (moveIndex === -1) {
        // Pick random available spot
        const availableMoves = board.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
        if (availableMoves.length > 0) {
            moveIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
    }

    if (moveIndex !== -1) {
        const cell = cells[moveIndex];
        board[moveIndex] = 'O';
        cell.textContent = 'O';
        cell.classList.add('o', 'taken');

        checkResult();

        if (gameActive) {
            currentPlayer = 'X';
            statusMessage.textContent = "Your Turn";
        }
    }
};

const findBestMove = (player) => {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] === player && board[b] === player && board[c] === '') return c;
        if (board[a] === player && board[c] === player && board[b] === '') return b;
        if (board[b] === player && board[c] === player && board[a] === '') return a;
    }
    return -1;
};

const winningLine = document.getElementById('winning-line');

const checkResult = () => {
    let roundWon = false;
    let winningLineIndices = [];
    let winType = ''; // row-x, col-x, diag-x

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] === '' || board[b] === '' || board[c] === '') {
            continue;
        }
        if (board[a] === board[b] && board[b] === board[c]) {
            roundWon = true;
            winningLineIndices = [a, b, c];

            // Determine win type for animation
            if (i < 3) winType = `row-${i}`;
            else if (i < 6) winType = `col-${i - 3}`;
            else winType = `diag-${i - 6}`;

            break;
        }
    }

    if (roundWon) {
        statusMessage.textContent = currentPlayer === 'X' ? "You Won!" : "Computer Won!";
        gameActive = false;
        updateScore(currentPlayer === 'X' ? 'player' : 'computer');
        highlightWinningCells(winningLineIndices);
        showWinningLine(winType, currentPlayer);
        setTimeout(restartGame, 1000); // Auto reset after 1 second
        return;
    }

    if (!board.includes('')) {
        statusMessage.textContent = "It's a Draw!";
        gameActive = false;
        updateScore('draw');
        setTimeout(restartGame, 1000); // Auto reset after 1 second
        return;
    }
};

const showWinningLine = (type, winner) => {
    winningLine.className = 'winning-line'; // Reset classes
    winningLine.classList.add(type);
    if (winner) winningLine.classList.add(winner.toLowerCase());

    // Force reflow to ensure transition plays if class changes immediately
    void winningLine.offsetWidth;
    winningLine.classList.add('active');
};

const highlightWinningCells = (indices) => {
    indices.forEach(index => {
        cells[index].classList.add('win');
    });
};

const updateScore = (winner) => {
    scores[winner]++;
    if (winner === 'player') playerScoreElement.textContent = scores.player;
    if (winner === 'computer') computerScoreElement.textContent = scores.computer;
    if (winner === 'draw') drawScoreElement.textContent = scores.draw;
};

const restartGame = () => {
    gameActive = true;
    currentPlayer = 'X';
    board = ['', '', '', '', '', '', '', '', ''];
    statusMessage.textContent = "Your Turn";

    // Reset winning line
    winningLine.className = 'winning-line';

    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'taken', 'win');
    });
};

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', restartGame);
