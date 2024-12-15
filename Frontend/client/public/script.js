// State management
const playlistState = {
    items: [],
    isOpen: false
};

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
    try {
        fetchMovies();
        loadUserFromSession();
        initializeEventListeners();
        
        // Add playlist initialization
        initializePlaylist();
        initializePlaylistUI();
        
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

        const profileLink = document.getElementById('profileLink');
        
        if (profileLink) {
            profileLink.addEventListener('click', function(e) {
                e.preventDefault();
                const profileModal = new window.bootstrap.Modal(document.getElementById('profileModal'));
                profileModal.show();
            });
        }
    } catch (error) {
        console.error('Error during DOMContentLoaded event:', error);
    }
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
function removeFromPlaylist(movieId) {
    playlistState.items = playlistState.items.filter(item => item.id !== movieId);
    localStorage.setItem('userPlaylist', JSON.stringify(playlistState.items));
    updatePlaylistBadge();
    renderPlaylistContent();
    showToast('Removed from playlist', 'success');
}

function updatePlaylistBadge() {
    const badge = document.querySelector('.playlist-count');
    if (badge) {
        badge.textContent = playlistState.items.length;
    }
}

function initializePlaylist() {
    try {
        const savedPlaylist = localStorage.getItem('userPlaylist');
        if (savedPlaylist) {
            // Validate the data before parsing
            if (typeof savedPlaylist === 'string' && savedPlaylist.trim() !== '') {
                const parsedPlaylist = JSON.parse(savedPlaylist);
                if (Array.isArray(parsedPlaylist) && parsedPlaylist.every(item => typeof item === 'object')) {
                    playlistState.items = parsedPlaylist;
                    updatePlaylistBadge();
                } else {
                    console.error('Invalid playlist data format');
                }
            } else {
                console.warn('No valid playlist data found');
            }
        } else {
            console.log('No saved playlist data available');
        }
    } catch (error) {
        console.error('Error initializing playlist:', error);
        // Optionally, you can reset the playlist state here
        playlistState.items = [];
    }
}


function initializePlaylistUI() {
    // Add playlist button to navbar
    const navbarContent = document.querySelector('#navbarContent .ms-auto');
    navbarContent.insertAdjacentHTML('beforebegin', `
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item dropdown">
          <button class="btn btn-link nav-link position-relative" id="playlistButton">
            <i class="fas fa-list"></i> Playlist
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary playlist-count">
              ${playlistState.items.length}
            </span>
          </button>
        </li>
      </ul>
    `);
  
    // Add playlist modal
    document.body.insertAdjacentHTML('beforeend', `
      <div class="modal fade" id="playlistModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">My Playlist</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div id="playlistContent" class="playlist-items"></div>
            </div>
          </div>
        </div>
      </div>
    `);
  
    // Add toast container
    document.body.insertAdjacentHTML('beforeend', `
      <div id="toastContainer" class="toast-container position-fixed bottom-0 end-0 p-3"></div>
    `);
  
    // Initialize playlist modal
    const playlistModal = new window.bootstrap.Modal(document.getElementById('playlistModal'));
  
    // Add click handler for playlist button
    document.getElementById('playlistButton').addEventListener('click', () => {
      playlistState.isOpen = true;
      renderPlaylistContent();
      playlistModal.show();
    });
  
    // Handle modal close
    document.getElementById('playlistModal').addEventListener('hidden.bs.modal', () => {
      playlistState.isOpen = false;
    });
}

function renderPlaylistContent() {
    const playlistContent = document.getElementById('playlistContent');
    
    if (playlistState.items.length === 0) {
        playlistContent.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-film fa-3x mb-3 text-muted"></i>
                <p class="text-muted">Your playlist is empty</p>
            </div>
        `;
        return;
    }
    
    playlistContent.innerHTML = `
        <div class="row g-3">
            ${playlistState.items.map(movie => `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100">
                        <img src="${movie.poster}" class="card-img-top" alt="${movie.title}">
                        <div class="card-body">
                            <h6 class="card-title">${movie.title}</h6>
                            <p class="card-text small text-muted">
                                Added ${new Date(movie.addedAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div class="card-footer bg-transparent border-top-0">
                            <button type="button" class="btn btn-sm btn-outline-danger" 
                                    onclick="removeFromPlaylist(${movie.id})">
                                <i class="fas fa-trash-alt"></i> Remove
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function addToPlaylist(movieId, movieTitle, moviePoster) {
    if (!state.currentUser) {
        showToast('Please log in to add to playlist', 'warning');
        return;
    }
    
    // Check if movie already exists in playlist
    if (playlistState.items.some(item => item.id === movieId)) {
        showToast('Movie already in playlist', 'info');
        return;
    }
    
    // Create a copy of the current state to avoid modifying the original object
    const newState = { ...playlistState };
    
    // Add movie to playlist
    newState.items = [...newState.items, {
        id: movieId,
        title: movieTitle,
        poster: moviePoster,
        addedAt: new Date().toISOString()
    }];
    
    // Save to localStorage
    try {
        localStorage.setItem('userPlaylist', JSON.stringify(newState.items));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        showToast('Failed to save to playlist', 'error');
        return;
    }
    
    // Update UI
    updatePlaylistBadge();
    showToast('Added to playlist successfully', 'success');
    
    // If playlist is open, refresh its content
    if (playlistState.isOpen) {
        renderPlaylistContent();
    }
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

    const profileLink = document.getElementById('profileLink');
    
    if (profileLink) {
        profileLink.addEventListener('click', function(e) {
            e.preventDefault();
            const profileModal = new window.bootstrap.Modal(document.getElementById('profileModal'));
            profileModal.show();
        });
    }
});

// User Profile Management
class UserProfile {
    constructor() {
        this.modal = document.getElementById('profileModal');
        this.bindEvents();
        this.loadUserData();
    }

    bindEvents() {
        // Save button click handler
        document.getElementById('saveProfileBtn').addEventListener('click', () => this.saveProfile());
        
        // Modal events
        this.modal.addEventListener('show.bs.modal', () => this.loadUserData());
    }

    async loadUserData() {
        try {
            // Simulate API call
            const userData = {
                username: "MovieBuff2024",
                joinDate: "January 2024",
                stats: {
                    moviesWatched: 142,
                    votingStreak: 8,
                    moviesVoted: 256,
                    moviesSuggested: 45,
                    totalWatchTime: "284 hours"
                },
                preferences: {
                    languages: ["English", "Japanese", "Korean"],
                    subtitles: "Always",
                    viewingTime: "Evening (8-11 PM)",
                    notifications: {
                        newMovies: true,
                        votingReminders: true,
                        shareHistory: true
                    }
                },
                favoriteGenres: ["Sci-Fi", "Thriller", "Animation"],
                movieNights: {
                    lastAttended: "Yesterday",
                    nextHosting: "Friday 8 PM"
                }
            };

            this.updateUIWithUserData(userData);
        } catch (error) {
            console.error('Error loading user data:', error);
            // Show error toast or notification (example)
            alert("There was an error loading your profile data. Please try again later.");
        }
    }

    updateUIWithUserData(data) {
        // Update profile header
        document.getElementById('profileUsername').textContent = data.username;
        document.getElementById('profileJoinDate').textContent = data.joinDate;

        // Update statistics
        document.getElementById('moviesWatchedCount').textContent = data.stats.moviesWatched;
        document.getElementById('votingStreak').textContent = data.stats.votingStreak;
        document.getElementById('moviesCompleted').textContent = data.stats.moviesWatched;
        document.getElementById('moviesVoted').textContent = data.stats.moviesVoted;
        document.getElementById('moviesSuggested').textContent = data.stats.moviesSuggested;
        document.getElementById('totalWatchTime').textContent = data.stats.totalWatchTime;

        // Update preferences
        this.updatePreferredLanguages(data.preferences.languages);
        document.getElementById('subtitlePreference').textContent = data.preferences.subtitles;
        document.getElementById('viewingTime').textContent = data.preferences.viewingTime;

        // Update notification settings
        document.getElementById('notifyNewMovies').checked = data.preferences.notifications.newMovies;
        document.getElementById('notifyVoting').checked = data.preferences.notifications.votingReminders;
        document.getElementById('shareHistory').checked = data.preferences.notifications.shareHistory;

        // Update favorite genres
        this.updateFavoriteGenres(data.favoriteGenres);

        // Update movie night info
        document.getElementById('lastAttended').textContent = data.movieNights.lastAttended;
        document.getElementById('nextHosting').textContent = data.movieNights.nextHosting;
    }

    updatePreferredLanguages(languages) {
        const container = document.getElementById('preferredLanguages');
        container.innerHTML = languages.map(lang => 
            `<span class="badge bg-secondary">${lang}</span>`
        ).join('');
    }

    updateFavoriteGenres(genres) {
        const container = document.getElementById('favoriteGenres');
        container.innerHTML = genres.map(genre => 
            `<span class="badge bg-primary">${genre}</span>`
        ).join('');
    }

    async saveProfile() {
        try {
            const profileData = {
                notifications: {
                    newMovies: document.getElementById('notifyNewMovies').checked,
                    votingReminders: document.getElementById('notifyVoting').checked,
                    shareHistory: document.getElementById('shareHistory').checked
                },
                // Add any other profile data you wish to save
            };

            // Simulate saving to an API (you can replace this with an actual API call)
            console.log('Saving profile data:', profileData);

            // Show success message (using Bootstrap Toast or a custom notification)
            const toastEl = document.createElement('div');
            toastEl.classList.add('toast', 'fade', 'show');
            toastEl.innerHTML = `
                <div class="toast-body">
                    Profile saved successfully!
                </div>
            `;
            document.body.appendChild(toastEl);
            setTimeout(() => toastEl.remove(), 3000); // Remove toast after 3 seconds
            
            // Close modal
            const modalInstance = window.bootstrap.Modal.getInstance(this.modal);
            modalInstance.hide();
        } catch (error) {
            console.error('Error saving profile:', error);
            // Show error toast or notification
            alert("There was an error saving your profile. Please try again later.");
        }
    }
}

// Initialize UserProfile class
const userProfile = new UserProfile();

document.getElementById('submitMovieBtn').addEventListener('click', handleAddMovie);

async function handleAddMovie(event) {
    event.preventDefault();

    // Gather data from the modal form
    const movieData = {
        id: Date.now(), // Generate unique ID
        title: document.getElementById('title').value,
        dateWatched: document.getElementById('dateWatched').value,
        watched: false,
        year: parseInt(document.getElementById('year').value),
        category: document.getElementById('category').value,
        trailerLink: document.getElementById('trailerLink').value,
        movieLink: document.getElementById('movieLink').value,
        modernTrailerLink: document.getElementById('modernTrailerLink').value,
        requestedBy: {
            userId: state.currentUser?.id || 'anonymous',
            username: document.getElementById('requestedBy').value,
            platform: 'Web'
        },
        language: document.getElementById('language').value,
        subtitles: document.getElementById('subtitles').value === 'true',
        voteCount: 0,
        imageUrl: '', // Default image
        runtime: "", // You might want to add this to your form
        ratings: "",
        trailerPrivate: false,
        moviePrivate: false
    };

    try {
        // Validate the data before sending (optional)
        if (!validateMovieData(movieData)) {
            throw new Error('Invalid movie data');
        }

        // Send the POST request to add the movie
        const response = await fetch('http://localhost:3000/add-movie', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(movieData),
        });

        if (!response.ok) {
            throw new Error('Failed to add movie');
        }

        // If successful, update the frontend
        state.movies.push(movieData);
        state.filteredMovies = [...state.movies];
        updateMovieDisplay(); // Assuming this updates the movie list in your UI

        // Close the modal
        const modal = window.bootstrap.Modal.getInstance(document.getElementById('addMovieModal'));
        modal.hide();

        // Show success message (can be done with a toast or alert)
        showToast('Movie added successfully!', 'success');

        // Reset the form
        document.getElementById('add-movie-form').reset();
    } catch (error) {
        console.error('Error adding movie:', error);
        showToast('Failed to add movie. Please try again.', 'error');
    }
}

async function updateMovieListJson(movies) {
    try {
        const response = await fetch('http://localhost:3000/update-movie-list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(movies),
        });

        if (!response.ok) {
            throw new Error('Failed to update movie list');
        }

        // Parse the response to get any returned data
        const data = await response.json();
        
        console.log('Movie list updated successfully:', data.message);
    } catch (error) {
        console.error('Error updating movie list:', error);
        throw error;
    }
}

// Helper function to show success/error messages (you may already have one)
function showToast(message, type) {
    const toast = new window.bootstrap.Toast(document.getElementById('liveToast'));
    const toastBody = document.querySelector('.toast-body');
    toastBody.textContent = message;
    toast.show();
}


function validateMovieData(data) {
    return (
        data.title && // Title is required
        data.year && // Year is required
        data.category && // Category is required
        data.requestedBy.username && // Requested By username is required
        data.language && // Language is required
        data.trailerLink && // Trailer Link is required
        data.movieLink && // Movie Link is required
        data.modernTrailerLink && // Modern Trailer Link is required
        data.dateWatched && // Date Watched is required
        data.imdbLink && // IMDB Link is required
        data.tmdbLink && // TMDB Link is required
        !isNaN(data.year) && // Year should be a number
        (data.subtitles === 'true' || data.subtitles === 'false') // Subtitles should be boolean
    );
}

function isValidUrl(string) {
    if (!string) return true; // Allow empty strings
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Add event listener for form submission
document.getElementById('submitMovieBtn').addEventListener('click', handleAddMovie);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('../../../service-worker.js', {
          scope: '/'
        });
        console.log('Service Worker registered with scope:', registration.scope);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    });
}

document.getElementById('saveSettingsBtn').addEventListener('click', function() {
    // Capture the values from the modal
    const emailNotifications = document.getElementById('emailNotifications').checked;
    const discordNotifications = document.getElementById('discordNotifications').checked;
    const voteLimit = document.getElementById('voteLimit').value;
    const votingDeadline = document.getElementById('votingDeadline').value;
    const theme = document.getElementById('themeSelector').value;
    const feedback = document.getElementById('feedback').value;

    // Log the values (you could send this data to your server or store it locally)
    console.log({
      emailNotifications,
      discordNotifications,
      voteLimit,
      votingDeadline,
      theme,
      feedback
    });

    // Optionally close the modal after saving
    const modal = window.bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
    modal.hide();
});