// State management

const playlistState = {
    items: [],
    isOpen: false
};

// Main application state
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

// Export the states
export { playlistState, state };
