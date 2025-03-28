import { displayMovies } from '../public/movies.mjs';

/**
 * Searches for movies based on the user input.
 * Retrieves the movie list from localStorage and filters it.
 * Displays the filtered movies.
 */
export function searchMovies() {
    try {
        // Get the search term
        const searchTerm = document.getElementById('movieSearch').value.trim().toLowerCase();

        // Validate the search term
        if (!searchTerm) {
            displayMovies([]);
            return;
        }

        // Retrieve the list of movies from localStorage
        const movieList = JSON.parse(localStorage.getItem('movieList')) || [];

        // Filter movies based on the search term
        const filteredMovies = movieList.filter(movie => 
            movie.title.toLowerCase().includes(searchTerm)
        );

        // Display the filtered movies
        displayMovies(filteredMovies);
    } catch (error) {
        console.error('Error searching movies:', error);
        displayMovies([]);
    }
}

/**
 * Debounces a function to delay its execution.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The delay in milliseconds.
 * @returns {Function} - The debounced function.
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Add event listener for the search input with debounce
document.getElementById('movieSearch').addEventListener('input', debounce(searchMovies, 300));
