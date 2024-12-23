import { state } from '../public/state.mjs';
import { showError } from '../public/utils.mjs';

export function createMovieCard(movie) {
    return `
        <div class="col">
            <div class="card h-100" data-movie-id="${movie.id}">
                <img src="${movie.imageUrl}" class="card-img-top" alt="${movie.title}" 
                     onerror="this.src=''">
                <div class="card-body">
                    <h5 class="card-title">${movie.title}</h5>
                    <p class="card-text">
                        <small class="text-muted">
                            ${movie.year} • ${movie.runtime} • ${movie.rating}
                        </small>
                    </p>
                    <p class="card-text">${movie.category}</p>
                    <p class="card-text">
                        <small class="text-muted">Requested by ${movie.requestedBy.username}</small>
                    </p>
                </div>
                <div class="card-footer">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="btn-group">
                            <button type="button" class="btn btn-sm btn-outline-primary vote-btn" 
                                    data-vote="up" ${state.currentUser ? '' : 'disabled'}>
                                <i class="fas fa-thumbs-up"></i> 
                                <span class="vote-count">${movie.voteCount}</span>
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-primary" 
                                    onclick="showMovieDetails('${movie.id}')">
                                <i class="fas fa-info-circle"></i> Details
                            </button>
                        </div>
                        <button type="button" 
                            class="btn btn-sm btn-primary add-to-playlist-btn" 
                            onclick="addToPlaylist(${movie.id}, '${movie.title}', '${movie.imageUrl}')"
                            ${state.currentUser ? '' : 'disabled'}>
                            <i class="fas fa-plus"></i> Add to Playlist
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function updateMovieDisplay() {
    const movieGrid = document.getElementById('movie-grid');
    const loadingPlaceholder = document.getElementById('loading-placeholder');
    
    if (loadingPlaceholder) loadingPlaceholder.style.display = 'none';
    
    if (state.filteredMovies.length === 0) {
        movieGrid.innerHTML = '<div class="col-12 text-center"><p>No movies found matching your criteria.</p></div>';
        return;
    }
    
    movieGrid.innerHTML = state.filteredMovies.map(movie => createMovieCard(movie)).join('');
}

// Movie fetching and display
export async function fetchMovies() {
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

export async function fetchLocalMovies() {
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

export function displayMovies(movies) {
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