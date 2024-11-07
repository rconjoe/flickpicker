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