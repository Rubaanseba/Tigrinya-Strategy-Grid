// --- CONFIGURATION ---
const BOARD_SIZE = 5;
const WINNING_LENGTH = 4;

// --- CITY & PIECE CONFIGURATION (Now Color-Based and Shape-Agnostic) ---
const CITIES = [
    { name: "ኣስመራ", colorSlot: 1, cssColorName: "GREEN" }, // Color Slot 1
    { name: "ከረን", colorSlot: 2, cssColorName: "RED" },      // Color Slot 2
    { name: "ባረንቱ", colorSlot: 1, cssColorName: "YELLOW" }, // Color Slot 1
    { name: "ማሳዋ", colorSlot: 2, cssColorName: "BLUE" },    // Color Slot 2
    { name: "አሰብ", colorSlot: 1, cssColorName: "ORANGE" },   // Color Slot 1
    { name: "መንደፈራ", colorSlot: 2, cssColorName: "PURPLE" }, // Color Slot 2
    { name: "ዓቴ", colorSlot: 1, cssColorName: "CYAN" }       // Color Slot 1
];

// --- TIGRINYA LANGUAGE AND AI CONFIG ---
const PLAYER_2_NAME_AI = "ኮምፒዩተር"; 
const STATUS_MESSAGE_P2_AI_THINKING = "ተራ፡ ኮምፒዩተር (ናይካ ተራ)";
const STATUS_MESSAGE_TIE = "ሕንፍሽፍሽ (Tie)።";
const RESTART_TEXT_GAME_END = "ዳግማይ ጸወታ"; 
const UNDO_TEXT = "ንድህሪት ተመለስ"; 

// --- GAME MODE STATE ---
let boardState = [];
let currentPlayer = 1;
let history = []; 
let gameActive = true;
let isVsAI = false; 
let isP1Choosing = true; 

// NEW: Dynamic City/Name Variables
let player1City = {}; 
let player2City = {}; 
let player2Name = ""; 
let player2ColorName = "";

// --- DOM ELEMENTS ---
const boardElement = document.getElementById('board');
const messageElement = document.getElementById('message');
const undoButton = document.getElementById('undo-btn');
const restartButton = document.getElementById('restart-btn');
const gameContainer = document.getElementById('game-container'); 

const modeSelectionDiv = document.getElementById('mode-selection');
const gameControlsDiv = document.getElementById('game-controls');
const vsHumanBtn = document.getElementById('vs-human-btn');
const vsAIBtn = document.getElementById('vs-ai-btn');

const citySelectionDiv = document.createElement('div');
citySelectionDiv.id = 'city-selection';
citySelectionDiv.style.display = 'none';

// Helper function to get color name for display
function getDisplayColorName(cssColorName) {
    // Simple way to map CSS name to a Tigrinya name if needed, 
    // but for now, we just use the city name itself to keep it clean.
    return cssColorName;
}

// Function to generate city buttons dynamically (NOW ONLY SHOWS CITY NAME)
function generateCityButtons(availableCities) {
    return availableCities.map(city => 
        `<button class="city-btn" data-city-name="${city.name}" data-color-slot="${city.colorSlot}" data-css-color="${city.cssColorName}">
            ${city.name}
        </button>`
    ).join('');
}


// --- INITIAL SETUP ---

document.addEventListener('DOMContentLoaded', initializeSetup);
restartButton.addEventListener('click', initializeSetup); 

function initializeSetup() {
    boardElement.style.display = 'none';
    gameControlsDiv.style.display = 'none';
    gameContainer.classList.remove('game-won');
    
    modeSelectionDiv.style.display = 'block';
    citySelectionDiv.style.display = 'none';
    
    messageElement.textContent = "ብምርጫኻ ጀምር";
    
    vsHumanBtn.onclick = () => showCitySelection(false);
    vsAIBtn.onclick = () => showCitySelection(true);
}

function showCitySelection(vsAI) {
    isVsAI = vsAI;
    isP1Choosing = true; 
    
    modeSelectionDiv.style.display = 'none';
    citySelectionDiv.style.display = 'block';
    
    if (!citySelectionDiv.parentNode) {
        modeSelectionDiv.parentNode.insertBefore(citySelectionDiv, modeSelectionDiv);
    }
    
    messageElement.textContent = "ንዓኹም ዝኸውን ከተማ ምረጽ";

    // Show all cities for Player 1 to choose
    citySelectionDiv.innerHTML = `
        <h3>ምርጫ ከተማ (City Choice):</h3>
        <p>1ይ ተጻዋታይ (Player 1) ምረጽ:</p>
        <div id="city-buttons-grid">
            ${generateCityButtons(CITIES)}
        </div>
    `;

    document.querySelectorAll('#city-selection .city-btn').forEach(button => {
        button.onclick = (e) => handleCitySelectionStep(e.currentTarget.dataset.cityName);
    });
}

function handleCitySelectionStep(chosenCityName) {
    if (isP1Choosing) {
        // --- STEP 1: Player 1 Chooses ---
        player1City = CITIES.find(city => city.name === chosenCityName);
        
        if (isVsAI) {
            // AI Mode: Determine AI's opponent piece and start game
            player2Name = PLAYER_2_NAME_AI;
            const p2ColorSlot = player1City.colorSlot === 1 ? 2 : 1;
            const p2ColorOption = CITIES.find(city => city.colorSlot === p2ColorSlot);
            player2ColorName = p2ColorOption.cssColorName;
            
            startGame();
        } else {
            // H vs H Mode: Proceed to P2 choice
            isP1Choosing = false;
            
            // FIX: Filter cities for P2. P2 can choose ANY city that has a DIFFERENT color slot
            // and any city that has the SAME color slot, but was NOT chosen by P1.
            const p2CityOptions = CITIES.filter(city => 
                city.colorSlot !== player1City.colorSlot || city.name !== player1City.name
            );
            
            citySelectionDiv.innerHTML = `
                <h3>ምርጫ ከተማ (City Choice):</h3>
                <p>2ይ ተጻዋታይ (Player 2) ምረጽ:</p>
                <div id="city-buttons-grid">
                    ${generateCityButtons(p2CityOptions)}
                </div>
            `;
            
            messageElement.textContent = "2ይ ተጻዋታይ ከተማኻ ምረጽ";
            
            // Re-attach listeners for P2 buttons
            document.querySelectorAll('#city-selection .city-btn').forEach(button => {
                button.onclick = (e) => handleCitySelectionStep(e.currentTarget.dataset.cityName);
            });
        }
    } else {
        // --- STEP 2: Player 2 Chooses (H vs H only) ---
        player2City = CITIES.find(city => city.name === chosenCityName);
        player2Name = player2City.name;
        player2ColorName = player2City.cssColorName;
        
        startGame();
    }
}


function startGame() {
    // CRITICAL: Apply the piece color variable to the board itself
    document.documentElement.style.setProperty('--player-1-color', `var(--${player1City.cssColorName})`);
    document.documentElement.style.setProperty('--player-2-color', `var(--${player2ColorName})`);

    boardElement.style.display = 'grid'; 
    gameControlsDiv.style.display = 'block';
    citySelectionDiv.style.display = 'none';
    
    boardElement.innerHTML = ''; 
    boardState = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0));
    history = [];
    currentPlayer = 1;
    gameActive = true;
    gameContainer.classList.remove('game-won'); 

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
        }
    }
    
    // DYNAMIC STATUS UPDATE (Removed piece names)
    updateStatus(`ተራ፡ ${player1City.name}`);
    undoButton.textContent = UNDO_TEXT; 
    restartButton.textContent = RESTART_TEXT_GAME_END;
    restartButton.disabled = false; 
    undoButton.disabled = true;
}

// --- CORE GAME LOGIC ---

function updateStatus(message) {
    messageElement.textContent = message;
}

function updateBoardVisuals() {
    const cells = boardElement.querySelectorAll('.cell');
    cells.forEach(cell => {
        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);
        
        cell.className = 'cell'; 
        if (boardState[r][c] === 1) {
            cell.classList.add('piece-1'); 
        } else if (boardState[r][c] === 2) {
            cell.classList.add('piece-2'); 
        }
    });
}

function handleCellClick(event) {
    if (!gameActive || (isVsAI && currentPlayer === 2)) return; 

    const cell = event.currentTarget;
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);

    if (boardState[r][c] !== 0) return; 

    history.push({ row: r, col: c, player: currentPlayer });
    undoButton.disabled = false;

    boardState[r][c] = currentPlayer;
    updateBoardVisuals();

    // Check for win AFTER placing the piece
    const winner = checkWin(r, c);
    if (winner !== null || isBoardFull()) {
        handleGameEnd(winner || 0);
        return;
    }

    if (isVsAI) {
        currentPlayer = 2; 
        updateStatus(STATUS_MESSAGE_P2_AI_THINKING); 
        setTimeout(computerMove, 700);
    } else {
        // Human vs Human logic (Removed piece names)
        currentPlayer = (currentPlayer === 1) ? 2 : 1;
        const nextPlayerCity = (currentPlayer === 1) ? player1City.name : player2Name;
        updateStatus(`ተራ፡ ${nextPlayerCity}`);
    }
}

// --- WINNING AND TIE LOGIC ---
// (No change needed here, as the winning logic relies only on the boardState array)

function checkWin(r, c) {
    const player = boardState[r][c];
    if (player === 0) return null;

    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1] 
    ];

    for (const [dr, dc] of directions) {
        let count = 1;
        
        for (let i = 1; i < WINNING_LENGTH; i++) {
            const nr = r + dr * i;
            const nc = c + dc * i;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && boardState[nr][nc] === player) {
                count++;
            } else {
                break;
            }
        }

        for (let i = 1; i < WINNING_LENGTH; i++) {
            const nr = r - dr * i;
            const nc = c - dc * i;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && boardState[nr][nc] === player) {
                count++;
            } else {
                break;
            }
        }

        if (count >= WINNING_LENGTH) {
            return player;
        }
    }
    return null;
}

function isBoardFull() {
    return boardState.every(row => row.every(cell => cell !== 0));
}

function handleGameEnd(winner) {
    gameActive = false;
    undoButton.disabled = true;
    restartButton.disabled = false; 

    let winnerName = "";
    if (winner === 1) {
        winnerName = player1City.name;
        gameContainer.classList.add('game-won'); 
        updateStatus(`🎉 ${winnerName} ኣዕዊቱ!`);
    } else if (winner === 2) {
        winnerName = player2Name;
        if (!isVsAI) {
             gameContainer.classList.add('game-won'); 
             updateStatus(`🎉 ${winnerName} ኣዕዊቱ!`);
        } else {
             updateStatus(`😢 ${winnerName} ኣዕዊቱ!`);
        }
    } else {
        updateStatus(STATUS_MESSAGE_TIE);
    }
    restartButton.textContent = RESTART_TEXT_GAME_END; 
}

// --- UNDO FEATURE (Logic retained) ---

undoButton.addEventListener('click', undoMove);

function undoMove() {
    if (history.length === 0 || !gameActive) return;

    let movesToUndo = isVsAI && history.length >= 2 ? 2 : 1;
    if (history.length === 0) return;

    for (let i = 0; i < movesToUndo && history.length > 0; i++) {
        const lastMove = history.pop();
        boardState[lastMove.row][lastMove.col] = 0;
    }

    currentPlayer = 1;
    updateBoardVisuals();
    // Reset status to Player 1's turn (Removed piece names)
    updateStatus(`ተራ፡ ${player1City.name}`); 
    
    if (history.length === 0) {
        undoButton.disabled = true;
    }
    gameContainer.classList.remove('game-won'); 
}

// --- COMPUTER AI LOGIC (Logic retained) ---

function computerMove() {
    let bestMove = findStrategicMove(2);
    
    if (!bestMove) {
        bestMove = findStrategicMove(1);
    }

    if (!bestMove && boardState[2][2] === 0) {
        bestMove = { row: 2, col: 2 };
    }
    
    // Fallback logic
    if (!bestMove) {
        const corners = [{row: 0, col: 0}, {row: 0, col: 4}, {row: 4, col: 0}, {row: 4, col: 4}];
        let emptySpots = [];
        
        for (const { row, col } of corners) {
            if (boardState[row][col] === 0) {
                emptySpots.push({ row, col });
            }
        }
        
        if (emptySpots.length === 0) {
            for (let r = 0; r < BOARD_SIZE; r++) {
                for (let c = 0; c < BOARD_SIZE; c++) {
                    if (boardState[r][c] === 0) {
                        emptySpots.push({ row: r, col: c });
                    }
                }
            }
        }

        if (emptySpots.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptySpots.length);
            bestMove = emptySpots[randomIndex];
        }
    }

    if (bestMove) {
        history.push({ row: bestMove.row, col: bestMove.col, player: currentPlayer });

        boardState[bestMove.row][bestMove.col] = currentPlayer;
        updateBoardVisuals(); 
        
        const winner = checkWin(bestMove.row, bestMove.col);
        if (winner !== null || isBoardFull()) {
            handleGameEnd(winner || 0);
            return;
        }

        currentPlayer = 1;
        // Reset status to Player 1's turn (Removed piece names)
        updateStatus(`ተራ፡ ${player1City.name}`);
    }
}

function findStrategicMove(playerToCheck) {
    let move = null;
    
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            
            if (boardState[r][c] === 0) {
                
                boardState[r][c] = playerToCheck; 
                
                if (checkWin(r, c) === playerToCheck) {
                    move = { row: r, col: c };
                }

                boardState[r][c] = 0; 

                if (move) {
                    return move;
                }
            }
        }
    }
    return null;
}
