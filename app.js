const express = require('express');
const session = require('express-session');
const multer = require('multer');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const { exec } = require('child_process');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({ secret: 'superSecret', resave: false, saveUninitialized: false }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// GET request without parameters:
app.get('/', (req, res) => {
  res.send('Welcome to the home page');
});

// GET request with query parameters:
app.get('/query', (req, res) => {
  const query = req.query;
  res.send(query);
});

// GET requests with path parameters:
app.get('/path/:id', (req, res) => {
  const id = req.params.id;
  res.send(`Path parameter: ${id}`);
});

// Request URL: http://localhost:3000/users/34/books/8989
// req.params: { "userId": "34", "bookId": "8989" }
app.get('/users/:userId/books/:bookId', (req, res) => {
  res.send(req.params)
})

// Request URL: http://localhost:3000/flights/LAX-SFO
// req.params: { "from": "LAX", "to": "SFO" }
app.get('/flights/:from-:to', (req, res) => {
  res.send(req.params)
})

// Request URL: http://localhost:3000/plantae/Prunus.persica
// req.params: { "genus": "Prunus", "species": "persica" }
app.get('/plantae/:genus.:species', (req, res) => {
  res.send(req.params)
})

// Request URL: http://localhost:3000/user/42
// req.params: {"userId": "42"}
app.get('/user/:userId(\d+)', (req, res) => {
  res.send(req.params)
})

// GET request with Schema:
const User = new Schema({
  username: {
    type: String,
    required: [
      true, 'Username is required.'
    ],
    unique: true
  },
  password: {
    type: String,
    select: false
  }
});

function listAdmin(req, res) {
  return User.find({})
      .select('-social')
      .exec()
      .then(notFound(res))
      .then(result(res))
      .catch(error(res));
}

function notFound(res) {
  return function(data) {
    if (!data) {
      res.status(404).send('Not found');
    }
    return data;
  };
}

function result(res) {
  return function(data) {
    res.json(data);
  };
}

function error(res) {
  return function(err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  };
}


app.get('/api/user/admin', listAdmin);

// POST request:
app.post('/post', (req, res) => {
  // Read the request body
  // Save data to database
  res.send('Data saved');
});

// PUT request:
app.put('/update/:id', (req, res) => {
  // Read the request body
  // Update data in database
  const id = req.params.id;
  res.send(`Data updated for ID: ${id}`);
});

// DELETE request:
app.delete('/delete/:id', (req, res) => {
  const id = req.params.id;
  // Delete data from database
  res.send(`Data deleted for ID: ${id}`);
});

// Authentication middleware:
const auth = (req, res, next) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "password") {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
};

app.post('/login', auth, (req, res) => {
  res.send('Authenticated');
});
