const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Create an HTTP server to serve static files
const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

    // Determine the content type based on file extension
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'application/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpeg';
            break;
    }

    // Read and serve the file
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500);
            res.end('Server Error');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

function getRandomZeroOrOne() {
    return Math.round(Math.random());
}

// Function to generate random test data
function generateRandomData() {
    const results = ['test pass', 'test fail'];
    const idx = getRandomZeroOrOne()
    console.log('Current test stats: ' + idx)
    const randomResult = results[idx];
    const timestamp = new Date().toISOString();
    return JSON.stringify({ result: randomResult, timestamp: timestamp });
}

// Broadcast data to all connected WebSocket clients
function broadcast() {
    const message = generateRandomData();
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Broadcast data every 1 second
setInterval(broadcast, 1000);

// Start the HTTP server
const port = 8080;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
