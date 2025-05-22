import { state } from './state.mjs';
import { showError } from './utils.mjs';
import { Pagination } from './pagination.mjs';

const DEFAULT_PAGE_SIZE = 5;
const MOVIES_PER_PAGE_VALUES = [1, 5, 10, 15];

// Check if running in a browser environment
const isBrowser = typeof window !== 'undefined';

const paginationSection = document.getElementById('movies-pagination-section');
const pagination = new Pagination(paginationSection, renderMoviesPage, DEFAULT_PAGE_SIZE, MOVIES_PER_PAGE_VALUES, 'movies-page-size-select');

if (isBrowser) {
    document.addEventListener('DOMContentLoaded', () => {
        // Load the full movie list on initial page load
        fetchMovies();
    });
}

// Helper function to create movie card HTML
function createMovieCardHTML(movie) {
    const fallbackImage = ''; // '/path/to/default.jpg';
    return `
        <div class="col">
            <div class="card h-100" data-movie-id="${movie.id}">
                <img src="${movie.imageUrl || fallbackImage}" 
                     class="card-img-top" alt="${movie.title || 'Movie Poster'}" loading="lazy"
                     onerror="this.onerror=null; this.src='${fallbackImage}'">
                <div class="card-body">
                    <h5 class="card-title">${movie.title || 'Untitled Movie'}</h5>
                    <p class="card-text">
                        <small class="text-muted">
                            ${movie.year || 'Unknown Year'} • ${movie.runtime || 'Unknown Runtime'} • ${movie.ratings || 'Unrated'}
                        </small>
                    </p>
                    <p class="card-text">${movie.category || 'General'}</p>
                    <p class="card-text">
                        <small class="text-muted">
                            Requested by ${movie.requestedBy?.username || 'Unknown User'}
                        </small>
                    </p>
                </div>
                <div class="card-footer">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="btn-group">
                            <button type="button" class="btn btn-sm btn-outline-primary vote-btn" 
                                    data-vote="up" ${state.currentUser ? '' : 'disabled'}>
                                <i class="fas fa-thumbs-up"></i> 
                                <span class="vote-count">${movie.voteCount || 0}</span>
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

// Update movie display dynamically
function updateMovieDisplay() {
    if (!isBrowser) return;

    const movieTable = document.getElementById('movie-table');
    const loadingPlaceholder = document.getElementById('loading-placeholder');

    // Hide loading placeholder
    if (loadingPlaceholder) loadingPlaceholder.style.display = 'none';

    // Show fallback message if no movies are found
    if (!state.filteredMovies || state.filteredMovies.length === 0) {
        movieTable.innerHTML = `
            <div class="col-12 text-center">
                <p>No movies found matching your criteria.</p>
            </div>
        `;
        return;
    }
    
    pagination.setTotalItems(state.filteredMovies.length);
    renderMoviesPage(1, DEFAULT_PAGE_SIZE);
}

function renderMoviesPage(page, pageSize) {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentPageMovies = state.filteredMovies.slice(startIndex, endIndex);

    // Render movie cards dynamically
    movieTable.innerHTML = state.filteredMovies.map(createMovieCardHTML).join('');

    document.querySelectorAll('.vote-btn').forEach(button => {
        button.addEventListener('click', handleVote);
    });
    const movieTable = document.getElementById('movie-table');
    movieTable.innerHTML = currentPageMovies.map(createMovieCardHTML).join('');
}

// Unified fetch function with fallback
async function fetchMovies(source = '/Data/movieList.json') {
    try {
        const response = await fetch(source);
        if (!response.ok) throw new Error('Failed to fetch movies');

        console.log('📂 Fetching movies from:', source); // Debugging line
        const movies = await response.json();
        state.movies = movies;
        state.filteredMovies = [...movies]; // Default filtered list
        updateMovieDisplay(); // Update UI after fetching
    } catch (error) {
        console.error('Error fetching movies:', error);
        showError('Failed to fetch movies. Please try again later.');
    }
}

// Add this function to handle votes
async function handleVote(event) {
    // Prevent default action if any
    event.preventDefault();
    
    // Only proceed if user is logged in
    if (!state.currentUser) {
        console.log(state.currentUser);
        alert('Please log in to vote');
        return;
    }
    
    const button = event.currentTarget;
    const movieCard = button.closest('[data-movie-id]');
    const movieId = movieCard.dataset.movieId;
    const voteType = button.dataset.vote;
    const voteCountElement = button.querySelector('.vote-count');
    const currentCount = parseInt(voteCountElement.textContent) || 0;
    voteCountElement.textContent = currentCount + 1; // "up" in this case
    
    try {
        // Call the API to update vote
        const response = await fetch(`http://localhost:3000/update-vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                movieId,
                voteType,
                userId: 1, // Replace with actual user ID, e.g., state.currentUser.id,
            }),
        });
        
        if (!response.ok) {
            voteCountElement.textContent = currentCount;
            throw new Error('Failed to update vote');
        }
        
        const result = await response.json();
        
        // Update the vote count in the UI
        const voteCountElement = button.querySelector('.vote-count');
        voteCountElement.textContent = result.newVoteCount;
        
        // Update the movie in our state
        const movieIndex = state.movies.findIndex(m => m.id == movieId);
        if (movieIndex !== -1) {
            state.movies[movieIndex].voteCount = result.newVoteCount;
        }
        
        const filteredIndex = state.filteredMovies.findIndex(m => m.id == movieId);
        if (filteredIndex !== -1) {
            state.filteredMovies[filteredIndex].voteCount = result.newVoteCount;
        }
        
    } catch (error) {
        voteCountElement.textContent = currentCount;
        console.error('Error updating vote:', error);
        alert('Failed to update vote. Please try again.');
    }
}

// Explicit function to display movies (wrapper around updateMovieDisplay)
function displayMovies(movieList) {
    if (!isBrowser) return;
    state.filteredMovies = movieList;
    updateMovieDisplay(movieList);
}


// Export module functions, including displayMovies
export { createMovieCardHTML, updateMovieDisplay, fetchMovies, displayMovies };
