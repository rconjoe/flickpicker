import express from 'express';
import movieController from './controllers.js';

const router = express.Router();

// Route to search movies
router.get('/search-movies', movieController.searchMovies);

export default router;
