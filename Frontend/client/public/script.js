// State management
const state = {
    movies: [],
    filteredMovies: [],
    currentUser: null,
    settings: {
        theme: 'dark',
        emailNotifications: true,
        discordNotifications: false,
        voteLimit: 3
    }
};

// Movie fetching and display
async function fetchMovies() {
    try {
        const response = await fetch('../../../Data/movieList.json');
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
        const response = await fetch('../../../Data/movieList.json');
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

function updateMovieDisplay() {
    const movieGrid = document.getElementById('movie-grid');
    const loadingPlaceholder = document.getElementById('loading-placeholder');
    
    if (loadingPlaceholder) loadingPlaceholder.style.display = 'none';
    
    if (state.filteredMovies.length === 0) {
        movieGrid.innerHTML = '<div class="col-12 text-center"><p>No movies found matching your criteria.</p></div>';
        return;
    }
    
    movieGrid.innerHTML = state.filteredMovies.map(movie => createMovieCard(movie)).join('');
}

function createMovieCard(movie) {
    return `
        <div class="col">
            <div class="card h-100" data-movie-id="${movie.id}">
                <img src="${movie.imageUrl}" class="card-img-top" alt="${movie.title}" 
                     onerror="this.src='/placeholder-movie.jpg'">
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
                        <button type="button" class="btn btn-sm btn-primary add-to-playlist-btn" 
                                ${state.currentUser ? '' : 'disabled'}>
                            Add to Playlist
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Filtering and Sorting
function applyFilters() {
    const genre = document.getElementById('genre-filter').value.toLowerCase();
    const year = document.getElementById('year-filter').value;
    const rating = document.getElementById('rating-filter').value;
    const sortOrder = document.getElementById('sort-order').value;
    
    state.filteredMovies = state.movies.filter(movie => {
        const genreMatch = !genre || movie.category.toLowerCase().includes(genre);
        const yearMatch = !year || movie.year.toString() === year;
        const ratingMatch = !rating || movie.rating === rating;
        return genreMatch && yearMatch && ratingMatch;
    });
    
    sortMovies(sortOrder);
    updateMovieDisplay();
}

function sortMovies(criteria) {
    state.filteredMovies.sort((a, b) => {
        switch(criteria) {
            case 'title':
                return a.title.localeCompare(b.title);
            case 'year':
                return b.year - a.year;
            case 'runtime':
                return parseFloat(a.runtime) - parseFloat(b.runtime);
            default:
                return 0;
        }
    });
}

// User Authentication
function login(username, password) {
    // In production, this should be an API call
    if (validateCredentials(username, password)) {
        state.currentUser = { username, id: Date.now() };
        sessionStorage.setItem('user', JSON.stringify(state.currentUser));
        updateAuthUI();
        $('#loginModal').modal('hide');
        showToast('Successfully logged in!');
    } else {
        showError('Invalid credentials');
    }
}

function logout() {
    state.currentUser = null;
    sessionStorage.removeItem('user');
    updateAuthUI();
    showToast('Successfully logged out');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchMovies();
    loadUserFromSession();
    initializeEventListeners();
});

function handleMovieInteraction(event) {
    const target = event.target;
    const movieCard = target.closest('.card');
    
    if (!movieCard) return;
    
    const movieId = movieCard.dataset.movieId;
    
    if (target.classList.contains('vote-btn')) {
        handleVote(movieId, target.dataset.vote);
    } else if (target.classList.contains('add-to-playlist-btn')) {
        addToPlaylist(movieId);
    }
}

function handleVote(movieId, voteType) {
    if (!state.currentUser) {
        showToast('Please log in to vote', 'warning');
        return;
    }
    
    // Implement voting logic here
    console.log(`Vote ${voteType} for movie ${movieId}`);
    // Update UI or make API call to record vote
}

function addToPlaylist(movieId) {
    if (!state.currentUser) {
        showToast('Please log in to add to playlist', 'warning');
        return;
    }
    
    // Implement add to playlist logic here
    console.log(`Add movie ${movieId} to playlist`);
    // Make API call or update local state
}

function initializeEventListeners() {
    // Filter listeners
    document.querySelectorAll('#filter-section select').forEach(select => {
        select.addEventListener('change', applyFilters);
    });
    
    // Auth listeners
    document.getElementById('loginBtn').addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        login(username, password);
    });
    
    document.getElementById('logoutLink').addEventListener('click', logout);
    
    // Movie interaction listeners
    document.getElementById('movie-grid').addEventListener('click', handleMovieInteraction);
}

// Utility Functions
function showToast(message, type = 'success') {
    // Implementation depends on your toast library
    console.log(`Toast: ${message} (${type})`);
}

function showError(message) {
    showToast(message, 'error');
}

function validateCredentials(username, password) {
    // Implement proper validation
    return username.length > 0 && password.length > 0;
}

function loadUserFromSession() {
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
}

function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('userMenu');
    const loginButton = document.getElementById('loginButton');
    
    if (state.currentUser) {
        loginButton.classList.add('d-none');
        userMenu.classList.remove('d-none');
        document.querySelector('.username').textContent = state.currentUser.username;
    } else {
        loginButton.classList.remove('d-none');
        userMenu.classList.add('d-none');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Get the settings link element
    const settingsLink = document.getElementById('settingsLink');
    
    if (settingsLink) {
        settingsLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Get the modal through bootstrap's constructor
            const settingsModal = new window.bootstrap.Modal(document.getElementById('settingsModal'));
            settingsModal.show();
        });
    }
});