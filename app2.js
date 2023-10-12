const express = require('express');
const session = require('express-session');
const multer = require('multer');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const { exec } = require('child_process');

const app2 = express();
const port = process.env.PORT || 3000;

app2.use(cors());
app2.use(cookieParser());
app2.use(express.urlencoded({ extended: false }));
app2.use(express.json());
app2.use(session({ secret: 'superSecret', resave: false, saveUninitialized: false }));
app2.set('view engine', 'ejs');
app2.set('views', path.join(__dirname, 'views'));


// Route modularization:
app2.use(require('./routes/exampleRoutes'));

// Route grouping - group related routes using the Express Router:
const userRouter = express.Router();

userRouter.get('/users', (req, res) => {
  res.send('Get users');
});

userRouter.post('/users', (req, res) => {
  res.send('Post users');
});

app2.use('/api', userRouter);

// Template engines - render an EJS template:
app2.get('/template', (req, res) => {
  res.render('template', { title: 'EJS Template', message: 'Hello from EJS' });
});

// Content types:
app2.get('/ct1', (req, res) => {
  res.json(null)
  res.json({ user: 'tobi' })
  res.status(500).json({ error: 'message' })
})

app2.get('/ct2', (req, res) => {
  res.jsonp({ user: 'tobi' })
  res.status(500).jsonp({ error: 'message' })
})

app2.get('/ct3', (req, res) => {
  res.set('Content-Type', 'text/html')
  res.send(Buffer.from('<p>some html</p>'))
})

app2.get('/ct4', (req, res) => {
  res.append('Content-Type', 'text/html')
  res.send(Buffer.from('<p>some html</p>'))
})

app2.get('/ct5', (req, res) => {
  res.type('.html')
  res.send(Buffer.from('<p>some html</p>'))
})

app2.get('/ct6', (req, res) => {
  res.format({
    'text/plain': function () {
      res.send('hey')
    },

    'text/html': function () {
      res.send('<p>hey</p>')
    },

    'application/json': function () {
      res.send({ message: 'hey' })
    },

    default: function () {
      // log the request and respond with 406
      res.status(406).send('Not Acceptable')
    }
  })
})

// Status codes:
app2.get('/sc1', (req, res) => {
  res.sendStatus(404)
})

app2.get('/sc2', (req, res) => {
  res.status(400).send('Bad Request')
})

// Command injection:
app2.get('/api/run-command', (req, res) => {
  const command = req.query.command;
  // Danger lurks here! We're directly using user-supplied input in the command.
  // An attacker can exploit this by injecting malicious commands, potentially compromising the server.
  // Always validate and sanitize user input, especially when it involves executing commands.

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Command execution failed: ${error}`);
      return res.status(500).json({ error: 'Command execution failed' });
    }

    return res.status(200).json({ output: stdout });
  });
});

// Log forging:
app2.get('/api/log-forging', (req, res) => {
  const user = req.query.user;
  const logEntry = `User ${user} accessed the API.`;

  // Vulnerability: Log Forging
  // Here, we're directly concatenating user input into the log message without proper validation or sanitization.
  // An attacker can manipulate the "user" query parameter to inject special characters or newline characters,
  // potentially creating forged log entries or even executing arbitrary code in some cases.

  console.log(logEntry); // Logging the potentially manipulated log entry

  return res.status(200).json({ message: 'Log entry created' });
});
