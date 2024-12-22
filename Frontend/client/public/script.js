import { playlistState, state } from '../public/state';
import { showError, showToast } from '../public/utils';
import { login, logout, isAuthenticated, loadUserFromSession } from '../public/auth';
import { initializePlaylist, initializePlaylistUI, addToPlaylist } from '../public/playlist';
import { searchMovies } from '../public/search';
import { fetchMovies, displayMovies, updateMovieDisplay } from '../public/movies';

// Initial display (show all movies on page load)
displayMovies(movies);

// Event listener for search input
document.getElementById('movieSearch').addEventListener('input', searchMovies);

function saveMoviesToFile() {
    const movieList = JSON.parse(localStorage.getItem('movieList')) || [];

    // Send the data to the server using fetch
    fetch('http://localhost:3000/save-movies', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(movieList)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Movies saved successfully!');
        } else {
            alert('Failed to save movies.');
        }
    })
    .catch(error => {
        console.error('Error saving movies:', error);
        alert('Error saving movies.');
    });
}

// Attach the function to the global scope
window.saveMoviesToFile = saveMoviesToFile;

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

document.addEventListener('DOMContentLoaded', function() {
    const addMovieButton = document.getElementById('addMovieButton');

    if (!isAuthenticated()) {
        addMovieButton.style.display = 'none';  // Hide "Add Movie" button
    } else {
        addMovieButton.style.display = 'block';  // Show "Add Movie" button
    }
});

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

document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordField = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');

    togglePassword.addEventListener('click', function() {
        // Toggle the password field type
        const type = passwordField.type === 'password' ? 'text' : 'password';
        passwordField.type = type;

        // Toggle the eye icon
        if (type === 'password') {
            eyeIcon.classList.remove('fa-solid fa-eye-slash');
            eyeIcon.classList.add('fa-solid fa-eye');
        } else {
            eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-solid fa-eye-slash');
        }
    });
});

document.getElementById('submitMovieBtn').addEventListener('click', function() {
    const title = document.getElementById('title').value;
    const dateWatched = document.getElementById('dateWatched').value;
    const year = document.getElementById('year').value;
    const category = document.getElementById('category').value;
    const trailerLink = document.getElementById('trailerLink').value;
    const movieLink = document.getElementById('movieLink').value;
    const modernTrailerLink = document.getElementById('modernTrailerLink').value;
    const requestedBy = document.getElementById('requestedBy').value;
    const language = document.getElementById('language').value;
    const subtitles = document.getElementById('subtitles').value === "true"; // Convert to boolean
    const imdbLink = document.getElementById('imdbLink').value;
    const tmdbLink = document.getElementById('tmdbLink').value;

    const newMovie = {
        id: Date.now(),
        title: title,
        dateWatched: dateWatched,
        watched: false,
        trailerLink: trailerLink,
        movieLink: movieLink,
        modernTrailerLink: modernTrailerLink,
        requestedBy: {
            userId: "987654320",
            username: requestedBy,
            platform: "Discord"
        },
        category: category,
        trailerPrivate: false,
        moviePrivate: false,
        year: year,
        subtitles: subtitles,
        language: language,
        voteCount: 0,
        imageUrl: "./img/movie1.jpg",
        runtime: "1h30m",
        ratings: ""
    };

    // Save the movie to localStorage (in the browser)
    let movieList = JSON.parse(localStorage.getItem('movieList')) || [];
    movieList.push(newMovie);
    localStorage.setItem('movieList', JSON.stringify(movieList));

    alert('Movie added successfully!');
    // Close the modal
    const myModal = new window.bootstrap.Modal(document.getElementById('addMovieModal'));
    myModal.hide();
    searchMovies();
});