require('dotenv').config();

const express = require('express');
const { hashPassword } = require('./auth.js');

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

app.get('/api/movies', movieHandlers.getMovies);
app.get('/api/movies/:id', movieHandlers.getMovieById);
app.get('/api/users', userHandlers.getUsers);
app.get('/api/users/:id', userHandlers.getUserById);

app.post('/api/movies', validateMovie.validateMovie, movieHandlers.postMovie);
app.post(
  '/api/users',
  hashPassword,
  validateUser.validateUser,
  userHandlers.addUser
);

app.put(
  '/api/movies/:id',
  validateMovie.validateMovie,
  movieHandlers.updateMovie
);
app.put(
  '/api/users/:id',
  hashPassword,
  validateUser.validateUser,
  userHandlers.updateUser
);

app.delete('/api/movies/:id', movieHandlers.deleteMovie);
app.delete('/api/users/:id', userHandlers.deleteUser);

app.listen(port, (err) => {
  if (err) {
    console.error('Something bad happened');
  } else {
    console.log(`Server is listening on ${port}`);
  }
});
