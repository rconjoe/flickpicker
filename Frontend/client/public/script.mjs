import { playlistState, state } from '../public/state.mjs';
import { showError, showToast } from '../public/utils.mjs';
import { login, logout, isAuthenticated, loadUserFromSession } from '../public/auth.mjs';
import { initializePlaylist, initializePlaylistUI, addToPlaylist } from '../public/playlist.mjs';
import { searchMovies } from '../public/search.mjs';
import { fetchMovies, displayMovies, updateMovieDisplay } from '../public/movies.mjs';

// Initial display (show all movies on page load)
displayMovies(movies);

// Event listener for search input
document.getElementById('movieSearch').addEventListener('input', searchMovies);

export function saveMoviesToFile() {
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
export function applyFilters() {
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

export function sortMovies(criteria) {
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

export function handleMovieInteraction(event) {
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

export function handleVote(movieId, voteType) {
    if (!state.currentUser) {
        showToast('Please log in to vote', 'warning');
        return;
    }
    
    // Implement voting logic here
    console.log(`Vote ${voteType} for movie ${movieId}`);
    // Update UI or make API call to record vote
}

export function initializeEventListeners() {
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

document.getElementById('submitMovieBtn').addEventListener('click', handleAddMovie);

export async function handleAddMovie(event) {
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

export async function updateMovieListJson(movies) {
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

export function validateMovieData(data) {
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

export function isValidUrl(string) {
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