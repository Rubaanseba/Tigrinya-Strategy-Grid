// --- Game Constants ---
const BOARD_SIZE = 5;
const WIN_CONDITION = 4;
const BOARD_ELEMENT = document.getElementById('board');
const MESSAGE_ELEMENT = document.getElementById('message');
const RESTART_BUTTON = document.getElementById('restart-btn');
const UNDO_BUTTON = document.getElementById('undo-btn'); // ADDED

// --- Game State ---
let boardState = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0)); 
let currentPlayer = 1;
let gameActive = true;
let history = []; // ADDED: Stores previous board states

// --- Tigrinya Text ---
const PLAYER_1_NAME = "ተጻዋታይ 1";
const PLAYER_2_NAME = "ተጻዋታይ 2";
const MESSAGE_WIN_1 = `${PLAYER_1_NAME} ስዒሩ! (Wins!)`;
const MESSAGE_WIN_2 = `${PLAYER_2_NAME} ስዒሩ! (Wins!)`;
const MESSAGE_TIE = "ማዕረ! (It's a Tie!)";

// --- Functions ---

function createBoard() {
    BOARD_ELEMENT.innerHTML = '';
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', handleCellClick);
            BOARD_ELEMENT.appendChild(cell);
        }
    }
    updateStatus(`ተራ፡ ${PLAYER_1_NAME}`);
}

function updateBoardVisuals() {
    // Helper function to update the look of the board based on boardState
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const player = boardState[row][col];
        
        cell.classList.remove('piece-1', 'piece-2');
        if (player === 1) {
            cell.classList.add('piece-1');
        } else if (player === 2) {
            cell.classList.add('piece-2');
        }
    });
}

function handleCellClick(event) {
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (boardState[row][col] !== 0 || !gameActive) {
        return; 
    }

    // 1. SAVE STATE: Deep copy the current board state and player to history BEFORE the move
    history.push({
        board: boardState.map(row => [...row]), 
        player: currentPlayer
    });
    UNDO_BUTTON.style.display = 'inline-block';

    // 2. MAKE MOVE: Update state and visual
    boardState[row][col] = currentPlayer;
    updateBoardVisuals(); // Use helper to update visuals

    // 3. Check for win/tie
    const winner = checkWin(row, col);
    if (winner !== null) {
        handleGameEnd(winner);
        return;
    }
    if (isBoardFull()) {
        handleGameEnd(0);
        return;
    }

    // 4. Switch player
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    const nextPlayerName = currentPlayer === 1 ? PLAYER_1_NAME : PLAYER_2_NAME;
    updateStatus(`ተራ፡ ${nextPlayerName}`);
}

function undoMove() {
    if (history.length === 0 || gameActive === false) {
        return;
    }

    // 1. Load the previous state from history
    const previousState = history.pop();
    boardState = previousState.board;
    currentPlayer = previousState.player;
    
    // 2. Update the visuals
    updateBoardVisuals(); 
    
    // 3. Update the status
    const playerName = currentPlayer === 1 ? PLAYER_1_NAME : PLAYER_2_NAME;
    updateStatus(`ተራ፡ ${playerName}`);

    // Hide undo button if history is empty
    if (history.length === 0) {
        UNDO_BUTTON.style.display = 'none';
    }
}

function checkWin(lastRow, lastCol) {
    const player = boardState[lastRow][lastCol];
    
    // Directions to check: horizontal, vertical, and two diagonals
    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1] 
    ];

    for (const [dr, dc] of directions) {
        let count = 1; // Start with the piece just placed
        
        // Check in one direction (e.g., right, down, or diagonal)
        for (let k = 1; k < WIN_CONDITION; k++) {
            const nr = lastRow + dr * k;
            const nc = lastCol + dc * k;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && boardState[nr][nc] === player) {
                count++;
            } else {
                break;
            }
        }
        
        // Check in the opposite direction (e.g., left, up, or opposite diagonal)
        for (let k = 1; k < WIN_CONDITION; k++) {
            const nr = lastRow - dr * k;
            const nc = lastCol - dc * k;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && boardState[nr][nc] === player) {
                count++;
            } else {
                break;
            }
        }
        
        if (count >= WIN_CONDITION) {
            return player; 
        }
    }
    return null;
}

function isBoardFull() {
    return boardState.flat().every(cell => cell !== 0);
}

function updateStatus(message, color = '#333') {
    MESSAGE_ELEMENT.textContent = message;
    MESSAGE_ELEMENT.style.color = color;
}

function handleGameEnd(winner) {
    gameActive = false;
    RESTART_BUTTON.style.display = 'block';
    
    // VISUAL POLISH: Add board glow
    BOARD_ELEMENT.classList.add('game-won'); 

    if (winner === 1) {
        updateStatus(MESSAGE_WIN_1, 'var(--red-color)');
    } else if (winner === 2) {
        updateStatus(MESSAGE_WIN_2, 'var(--green-color)');
    } else {
        updateStatus(MESSAGE_TIE, '#333');
    }
}

function restartGame() {
    boardState = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    currentPlayer = 1;
    gameActive = true;
    RESTART_BUTTON.style.display = 'none';
    UNDO_BUTTON.style.display = 'none';
    history = []; // Clear history

    // VISUAL POLISH: Remove board glow and clear pieces
    BOARD_ELEMENT.classList.remove('game-won'); 
    updateBoardVisuals(); 
    
    updateStatus(`ተራ፡ ${PLAYER_1_NAME}`);
}

// --- Initialization ---
createBoard();
RESTART_BUTTON.addEventListener('click', restartGame);
UNDO_BUTTON.addEventListener('click', undoMove); // ADDED: Link Undo