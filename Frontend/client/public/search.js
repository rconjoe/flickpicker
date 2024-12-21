
function searchMovies() {
    // Get the search term
    const searchTerm = document.getElementById('movieSearch').value.toLowerCase();
    
    // Retrieve the list of movies from localStorage
    const movieList = JSON.parse(localStorage.getItem('movieList')) || [];

    // Filter movies based on the search term
    const filteredMovies = movieList.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm)
    );

    // Display the filtered movies
    displayMovies(filteredMovies);
}