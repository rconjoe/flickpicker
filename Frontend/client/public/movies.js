// Movie fetching and display
async function fetchMovies() {
    try {
        const response = await fetch('/Data/movieList.json'); // Path to the static JSON served by your backend
        if (!response.ok) throw new Error('Failed to fetch movies');
        
        state.movies = await response.json();
        state.filteredMovies = [...state.movies];
        updateMovieDisplay();
    } catch (error) {
        console.error('Error fetching movies:', error);
        fetchLocalMovies();
    }
}

async function fetchLocalMovies() {
    try {
        const response = await fetch('/Data/movieList.json'); // Same path as above
        if (!response.ok) throw new Error('Failed to fetch local movies');
        
        state.movies = await response.json();
        state.filteredMovies = [...state.movies];
        updateMovieDisplay();
        showError('API is down, using local data.');
    } catch (error) {
        console.error('Error fetching local movies:', error);
        showError('Failed to load movies. Please try again later.');
    }
}

function displayMovies(movies) {
    const movieGrid = document.getElementById('movie-grid');
    movieGrid.innerHTML = ''; // Clear existing content

    // Loop through the movies and create HTML elements to display them
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('col', 'mb-4');

        movieCard.innerHTML = `
            <div class="card">
                <img src="${movie.imageUrl}" class="card-img-top" alt="${movie.title}">
                <div class="card-body">
                    <h5 class="card-title">${movie.title}</h5>
                    <p class="card-text">Year: ${movie.year}</p>
                    <p class="card-text">Category: ${movie.category}</p>
                    <p class="card-text">Watched: ${movie.watched ? "Yes" : "No"}</p>
                    <a href="${movie.trailerLink}" class="btn btn-primary" target="_blank">Watch Trailer</a>
                </div>
            </div>
        `;

        movieGrid.appendChild(movieCard);
    });
}