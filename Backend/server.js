const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const { updateMovieListJson } = require('../Frontend/client/public/script');

const filePath = path.join(__dirname, '..', 'Data', 'movieList.json');

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../Frontend/client/public')));

const clientScript = require('../Frontend/client/script');

// Optional: Route to serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/client/public', 'index.html'));
});

// Endpoint to handle adding a movie to the JSON file
app.post('/add-movie', async (req, res) => {
    try {
        const movieData = req.body;
        // Validate input
        if (!movieData || !movieData.title) {
            return res.status(400).json({ error: 'Invalid request data' });
        }

        // Path to your movieList.json file
        const movieListPath = path.join(__dirname, 'Data', 'movieList.json');

        let movieList = await fs.readFile(movieListPath, 'utf8');
        movieList = JSON.parse(movieList);

        // Add the new movie to the list
        movieList.push(movieData);

        // Write the updated movie list back to the JSON file
        await fs.writeFile(movieListPath, JSON.stringify(movieList, null, 2));

        res.status(200).json({ message: 'Movie added successfully', data: movieData });
    } catch (error) {
        console.error('Error adding movie:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/update-movie-list', async (req, res) => {
    try {
        const movies = req.body;
        
        // Update the movie list JSON file
        await updateMovieListJson(movies);

        res.status(200).json({ message: 'Movie list updated successfully' });
    } catch (error) {
        console.error('Error updating movie list:', error);
        res.status(500).json({ error: 'Failed to update movie list' });
    }
});

app.post('/save-movies', (req, res) => {
    const movieList = req.body;

    // Define the path to the JSON file
    const filePath = path.join(__dirname, 'Data', 'movieList.json');

    // Write the movie list to the JSON file
    fs.writeFile(filePath, JSON.stringify(movieList, null, 2), (err) => {
        if (err) {
            console.error('Error saving movies:', err);
            return res.status(500).json({ success: false, message: 'Failed to save movies' });
        }

        console.log('Movies saved successfully!');
        return res.json({ success: true, message: 'Movies saved successfully' });
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