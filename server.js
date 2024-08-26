const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Initial game state
let gameState = [
    ["A-P1", "A-H1", "A-H2", "A-H3", "A-P2"], // A's pieces
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["B-P1", "B-H1", "B-H2", "B-H3", "B-P2"]  // B's pieces
];

let currentPlayer = 'A';

app.use(express.static('.'));

// Function to broadcast data to all clients
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// Handle WebSocket connections
wss.on('connection', ws => {
    // Send the initial game state to the client
    ws.send(JSON.stringify({
        type: 'init',
        gameState,
        currentPlayer
    }));

    // Handle incoming messages from clients
    ws.on('message', message => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'move':
                handleMove(data);
                break;

            case 'chat':
                broadcast({
                    type: 'chat',
                    message: data.message
                });
                break;

            case 'restart':
                handleRestart();
                break;

            default:
                console.error('Unknown message type:', data.type);
        }
    });
});

// Function to handle a move
function handleMove(data) {
    const { fromRow, fromCol, toRow, toCol } = data;

    // Move the character
    gameState[toRow][toCol] = gameState[fromRow][fromCol];
    gameState[fromRow][fromCol] = "";

    // Switch the turn
    currentPlayer = currentPlayer === 'A' ? 'B' : 'A';

    // Broadcast the updated game state
    broadcast({
        type: 'update',
        gameState,
        currentPlayer
    });
}

// Function to handle restarting the game
function handleRestart() {
    gameState = [
        ["A-P1", "A-H1", "A-H2", "A-H3", "A-P2"], // Reset to initial state
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["B-P1", "B-H1", "B-H2", "B-H3", "B-P2"]  // Reset to initial state
    ];
    currentPlayer = 'A';

    // Broadcast the reset game state
    broadcast({
        type: 'update',
        gameState,
        currentPlayer
    });
}

server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
