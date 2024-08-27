
# Multiplayer Game with WebSockets

This project is a simple multiplayer game built with Node.js, Express, and WebSockets. Players take turns moving their pieces on a grid. The game includes real-time communication, a chat feature, and the ability to restart the game.

## Project Structure

.
├── index.html        # Frontend file served to clients
├── script.js         # Frontend JavaScript handling game interactions
├── server.js         # Backend server handling WebSocket connections and game logic
├── package.json      # Node.js dependencies and scripts
└── README.md         # Project documentation

## Features

- **Real-time Multiplayer:** Two players can play the game simultaneously with real-time updates using WebSockets.
- **Turn-Based System:** Players alternate turns while moving their pieces.
- **Chat Functionality:** Players can send chat messages to each other during the game.
- **Game Restart:** Either player can reset the game to its initial state.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Wasims0663/Hitwicket.git
   cd multiplayer-game
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the server:

   ```bash
   npm start
   ```

4. Open your browser and navigate to:  http://localhost:8080
5. Open multiple browser tabs to test the multiplayer functionality.

### How It Works

- The server uses WebSockets to communicate game state and chat messages between clients.
- The game starts with Player A, and players take turns moving their pieces.
- The chat feature allows players to send messages during the game.
- A restart button allows players to reset the game to its original state.

## Game Logic

- **Initial State:**
  - Player A's pieces are at the top row.
  - Player B's pieces are at the bottom row.

- **Move Logic:**
  - Players can move their pieces to empty cells.
  - The current player is switched after each valid move.

- **Chat Feature:**
  - Chat messages are broadcasted to all connected clients.

- **Game Restart:**
  - The game can be reset at any time, returning all pieces to their initial positions.

## Example Code

Here is a brief overview of how the WebSocket server handles connections and game logic:

```javascript
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let gameState = [
    ["A-P1", "A-H1", "A-H2", "A-H3", "A-P2"],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["B-P1", "B-H1", "B-H2", "B-H3", "B-P2"]
];

let currentPlayer = 'A';

// Serve static files (like index.html and script.js)
app.use(express.static('.'));

// Function to broadcast data to all clients
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// WebSocket connection handler
wss.on('connection', ws => {
    ws.send(JSON.stringify({
        type: 'init',
        gameState,
        currentPlayer
    }));

    ws.on('message', message => {
        const data = JSON.parse(message);
        // Handle different message types (e.g., move, chat, restart)
    });
});

server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
```

## Deployment

To deploy this application, you can use a platform like [Vercel](https://vercel.com/), [Heroku](https://www.heroku.com/), or [DigitalOcean](https://www.digitalocean.com/).

### Deploying on Vercel

1. Install the Vercel CLI:

   ```bash
   npm install -g vercel
   ```

2. Deploy your project:

   ```bash
   vercel
   ```

3. Follow the prompts to set up your project. Vercel will automatically detect and deploy your Node.js server.

## Contributing

Feel free to open issues or submit pull requests if you have suggestions for improvements or bug fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
