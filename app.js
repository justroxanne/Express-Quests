require('dotenv').config();

const express = require('express');
const { hashPassword, verifyPassword, verifyToken } = require('./auth.js');
const { checkId } = require('./checkId.js');

const app = express();

app.use(express.json());

const port = process.env.APP_PORT ?? 5001;

const welcome = (req, res) => {
  res.send('Welcome to my favourite movie list');
};

app.get('/', welcome);

const movieHandlers = require('./movieHandlers');
const userHandlers = require('./userHandlers');
const validateMovie = require('./validateMovie');
const validateUser = require('./validateUser');

// Public routes

app.get('/api/movies', movieHandlers.getMovies);
app.get('/api/movies/:id', movieHandlers.getMovieById);
app.get('/api/users', userHandlers.getUsers);
app.get('/api/users/:id', userHandlers.getUserById);
app.post(
  '/api/users',
  hashPassword,
  validateUser.validateUser,
  userHandlers.addUser
);
app.post(
  '/api/login',
  userHandlers.getUserByEmailWithPasswordAndPassToNext,
  verifyPassword
);

app.use(verifyToken);

// Protected routes

app.post('/api/movies', validateMovie.validateMovie, movieHandlers.postMovie);

app.put(
  '/api/movies/:id',
  validateMovie.validateMovie,
  movieHandlers.updateMovie
);
app.put(
  '/api/users/:id',
  hashPassword,
  checkId,
  validateUser.validateUser,
  userHandlers.updateUser
);

app.delete('/api/movies/:id', movieHandlers.deleteMovie);
app.delete('/api/users/:id', checkId, userHandlers.deleteUser);

app.listen(port, (err) => {
  if (err) {
    console.error('Something bad happened');
  } else {
    console.log(`Server is listening on ${port}`);
  }
});
