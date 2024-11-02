const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../Frontend/client/public')));

// Optional: Route to serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/client/public', 'index.html'));
});

const DEFAULT_PORT = 3000;
const MAX_PORT = 4000; // Set an upper limit for port scanning

const checkPort = (port) => {
    return new Promise((resolve, reject) => {
        const server = app.listen(port, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(server);
            }
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                reject(err); // Port is in use
            } else {
                resolve(server); // Other error
            }
        });
    });
};

const startServer = async (port) => {
    try {
        const server = await checkPort(port);
        console.log(`Server is running on http://localhost:${port}`);
    } catch (error) {
        if (error.code === 'EADDRINUSE') {
            if (port < MAX_PORT) {
                startServer(port + 1); // Try the next port
            } else {
                console.error('No available ports in the range.');
            }
        } else {
            console.error('Error starting server:', error);
        }
    }
};

startServer(DEFAULT_PORT);
