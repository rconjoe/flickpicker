import { state } from './state.mjs';
import { showError, showToast } from './utils.mjs';
import { addToPlaylist } from './playlist.mjs';
import { Pagination } from './pagination.mjs';

const DEFAULT_PAGE_SIZE = 5;
const MOVIES_PER_PAGE_VALUES = [1, 5, 10, 15];

// Cache DOM elements
const cachedElements = {
    movieTable: document.getElementById('movie-table'),
};

document.addEventListener('DOMContentLoaded', () => {
    // Load the full movie list on initial page load
    loadMovies();

    // Event listener for adding movie form submission
    const form = document.getElementById("add-movie-form");
    if (form) {
        form.addEventListener("submit", saveMovie);
    } else {
        console.error("Form with id 'add-movie-form' not found.");
    }

    // Add movie button visibility
    const addMovieButton = document.getElementById("addMovieButton");
    if (addMovieButton) {
        try {
            addMovieButton.style.display = isAuthenticated() ? "block" : "none";
        } catch (error) {
            console.error("Error checking authentication:", error);
            addMovieButton.style.display = "none";
        }
    }

    // Initialize event listeners for filters
    document.querySelectorAll("#filter-section select").forEach((select) => {
        select.addEventListener("change", applyFilters);
    });

    const paginationSection = document.getElementById('movies-pagination-section');
    const pagination = new Pagination(paginationSection, renderMoviesPage, DEFAULT_PAGE_SIZE, MOVIES_PER_PAGE_VALUES, 'movies-page-size-select');

    if (cachedElements.movieTable) {
        cachedElements.movieTable.addEventListener("click", handleMovieInteraction);
    }
}, { once: true });

function handleMovieInteraction(event) {
    const target = event.target;
    const movieCard = target.closest(".card");

    if (!movieCard) return;

    const movieId = movieCard.dataset.movieId;

    if (target.classList.contains("vote-btn")) {
        handleVote(movieId, target.dataset.vote);
    } else if (target.classList.contains("add-to-playlist-btn")) {
        addToPlaylist(movieId);
    }
}

function handleVote(movieId, voteType) {
    if (
        !state.currentUser ||
        !state.currentUser.id ||
        !state.currentUser.username
    ) {
        showToast("Please log in to vote", "warning");
        return;
    }

    console.log(`Vote ${voteType} for movie ${movieId}`);
    // Update UI or make API call to record vote
}

// Helper function to create movie card HTML
function createMovieCardHTML(movie) {
    const fallbackImage = '';
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
    if (typeof window === 'undefined') return;

    const movieTable = document.getElementById('movie-table');
    const loadingPlaceholder = document.getElementById('loading-placeholder');

    if (loadingPlaceholder) loadingPlaceholder.style.display = 'none';

    if (!state.filteredMovies || state.filteredMovies.length === 0) {
        movieTable.innerHTML = `
            <div class="col-12 text
