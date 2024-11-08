const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../Frontend/client/public')));

// Optional: Route to serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/client/public', 'index.html'));
});

// Endpoint to handle adding a movie to the JSON file
app.post('/add-movie', (req, res) => {
    const movieData = req.body; // Get movie data from the request body

    // Path to your movieList.json file
    const movieListPath = path.join(__dirname, 'Data', 'movieList.json');

    // Read the existing movie list
    fs.readFile(movieListPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading movie list:', err);
            return res.status(500).json({ error: 'Failed to read movie list' });
        }

        let movieList = [];
        try {
            movieList = JSON.parse(data); // Parse the existing movie list
        } catch (err) {
            console.error('Error parsing movie list:', err);
            return res.status(500).json({ error: 'Failed to parse movie list' });
        }

        // Add the new movie to the list
        movieList.push(movieData);

        // Write the updated movie list back to the JSON file
        fs.writeFile(movieListPath, JSON.stringify(movieList, null, 2), (err) => {
            if (err) {
                console.error('Error writing to movie list:', err);
                return res.status(500).json({ error: 'Failed to write movie list' });
            }

            // Send a success response
            res.status(200).json({ message: 'Movie added successfully' });
        });
    });
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

// Start the server
startServer(DEFAULT_PORT);