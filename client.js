document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const gameStatus = document.getElementById('game-status');
    const moveButtons = document.getElementById('move-buttons');
    const chatLog = document.getElementById('chat-log');
    const chatInput = document.getElementById('chat-input');
    const sendMessageButton = document.getElementById('send-message');
    const restartButton = document.getElementById('restart-game');

    const moveSound = new Audio('move-sound.mp3');
    const captureSound = new Audio('capture-sound.mp3');

    const socket = new WebSocket('ws://localhost:8080');

    let currentPlayer = 'A';
    let selectedCell = null;
    let gameState = [];
    let opponentPlayer = currentPlayer === 'A' ? 'B' : 'A';

    socket.onmessage = event => {
        const data = JSON.parse(event.data);

        if (data.type === 'init' || data.type === 'update') {
            gameState = data.gameState;
            currentPlayer = data.currentPlayer;
            opponentPlayer = currentPlayer === 'A' ? 'B' : 'A';
            updateUI();
        } else if (data.type === 'chat') {
            displayMessage(data.message);
        }
    };

    socket.onerror = error => console.error('WebSocket Error:', error);
    socket.onclose = () => console.log('WebSocket connection closed');

    function updateUI() {
        gameBoard.innerHTML = '';
        gameStatus.textContent = `Player ${currentPlayer}'s Turn`;

        gameState.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('cell');
                cellDiv.textContent = cell;
                cellDiv.dataset.position = `${rowIndex}-${colIndex}`;
                cellDiv.onclick = () => onCellClick(rowIndex, colIndex);
                gameBoard.appendChild(cellDiv);
            });
        });
    }

    function onCellClick(rowIndex, colIndex) {
        const selectedCharacter = gameState[rowIndex][colIndex];
        if (selectedCharacter.startsWith(currentPlayer)) {
            selectedCell = { rowIndex, colIndex };
            showMoveOptions(rowIndex, colIndex);
        }
    }

    function showMoveOptions(rowIndex, colIndex) {
        clearHighlights(); // Clear any existing highlights

        const character = gameState[rowIndex][colIndex];
        const moves = getMoveOptions(character, rowIndex, colIndex);

        moves.forEach(move => {
            const cell = document.querySelector(`[data-position="${move.toRow}-${move.toCol}"]`);
            if (cell) {
                cell.classList.add('highlight');
            }
        });

        // Display move buttons for actions
        moveButtons.innerHTML = '';
        moves.forEach(move => {
            const moveButton = document.createElement('button');
            moveButton.textContent = move.label;
            moveButton.classList.add('btn', 'btn-primary');
            moveButton.onclick = () => moveCharacter(move.toRow, move.toCol);
            moveButtons.appendChild(moveButton);
        });
    }

    function clearHighlights() {
        const highlightedCells = document.querySelectorAll('.highlight');
        highlightedCells.forEach(cell => cell.classList.remove('highlight'));
    }

    function getMoveOptions(character, rowIndex, colIndex) {
        const moves = [];
        const directions = [];
    
        if (character.endsWith('P1') || character.endsWith('P2')) { // Pawn movement
            directions.push(
                { row: -1, col: 0, label: 'F' }, // Forward
                { row: 1, col: 0, label: 'B' },  // Backward
                { row: 0, col: -1, label: 'L' }, // Left
                { row: 0, col: 1, label: 'R' }   // Right
            );
        } else if (character.endsWith('H1') || character.endsWith('H3')) { // Hero1 and Hero3 movement
            directions.push(
                { row: -2, col: 0, label: 'F' }, // Two Up
                { row: 2, col: 0, label: 'B' },  // Two Down
                { row: 0, col: -2, label: 'L' }, // Two Left
                { row: 0, col: 2, label: 'R' }   // Two Right
            );
        } else if (character.endsWith('H2')) { // Hero2 movement
            directions.push(
                { row: -2, col: -2, label: 'FL' }, // Forward-Left
                { row: -2, col: 2, label: 'FR' },  // Forward-Right
                { row: 2, col: -2, label: 'BL' },  // Backward-Left
                { row: 2, col: 2, label: 'BR' }    // Backward-Right
            );
        }
    
        directions.forEach(dir => {
            const newRowIndex = rowIndex + dir.row;
            const newColIndex = colIndex + dir.col;
    
            if (newRowIndex >= 0 && newRowIndex < gameState.length &&
                newColIndex >= 0 && newColIndex < gameState[0].length) {
                
                const targetCell = gameState[newRowIndex][newColIndex];
                const isOpponent = targetCell && !targetCell.startsWith(currentPlayer);
                
                if (!targetCell || isOpponent) {
                    moves.push({
                        toRow: newRowIndex,
                        toCol: newColIndex,
                        label: dir.label
                    });
                }
            }
        });
    
        return moves;
    }
    

    function moveCharacter(toRow, toCol) {
        if (selectedCell) {
            const { rowIndex, colIndex } = selectedCell;
            socket.send(JSON.stringify({
                type: 'move',
                fromRow: rowIndex,
                fromCol: colIndex,
                toRow: toRow,
                toCol: toCol
            }));

            moveSound.play();
            selectedCell = null; // Clear selected cell after move
        }
    }

    function displayMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        chatLog.appendChild(messageDiv);
    }

    sendMessageButton.addEventListener('click', () => {
        const message = chatInput.value;
        if (message) {
            socket.send(JSON.stringify({ type: 'chat', message, player: currentPlayer }));
            chatInput.value = '';
        }
    });

    restartButton.addEventListener('click', () => {
        socket.send(JSON.stringify({ type: 'restart' }));
    });

    function sendEmoji(emoji) {
        socket.send(JSON.stringify({ type: 'chat', message: emoji, player: currentPlayer }));
    }
});
