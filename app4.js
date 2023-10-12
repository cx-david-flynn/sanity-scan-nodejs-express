const express = require('express');
const session = require('express-session');
const multer = require('multer');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const { exec } = require('child_process');

const app4 = express();
const port = process.env.PORT || 3000;

app4.use(cors());
app4.use(cookieParser());
app4.use(express.urlencoded({ extended: false }));
app4.use(express.json());
app4.use(session({ secret: 'superSecret', resave: false, saveUninitialized: false }));
app4.set('view engine', 'ejs');
app4.set('views', path.join(__dirname, 'views'));

// Simple middleware:
const logMiddleware = (req, res, next) => {
  console.log(`Request: ${req.method} - ${req.url}`);
  next();
};

app4.use(logMiddleware);

// app.all case:
app4.all('/secret', (req, res, next) => {
  console.log('Accessing the secret section ...')
  next() // pass control to the next handler
})

// app.route case:
app4.route('/events')
    .all(function (req, res, next) {
      // runs for all HTTP verbs first
      // think of it as route specific middleware!
    })
    .get(function (req, res, next) {
      res.json({})
    })
    .post(function (req, res, next) {
      // maybe add a new event...
    })

// String patterns in URL:
// Route path matches 'acd' and 'abcd'
app4.get('/ab?cd', (req, res) => {
  res.send('ab?cd')
})

// Matches 'abcd', 'abbcd', 'abbbcd' and so on
app4.get('/ab+cd', (req, res) => {
  res.send('ab+cd')
})

// Matches 'abcd', 'abRANDOMcd' and so on
app4.get('/ab*cd', (req, res) => {
  res.send('ab*cd')
})

// Matches 'abe' and 'abcde'
app4.get('/ab(cd)?e', (req, res) => {
  res.send('ab(cd)?e')
})

// Middleware for error handling:
app4.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});