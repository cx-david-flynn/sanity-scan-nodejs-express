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

// Simple middleware:
const logMiddleware = (req, res, next) => {
  console.log(`Request: ${req.method} - ${req.url}`);
  next();
};

app.use(logMiddleware);

// app.all case:
app.all('/secret', (req, res, next) => {
  console.log('Accessing the secret section ...')
  next() // pass control to the next handler
})

// app.route case:
app.route('/events')
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
app.get('/ab?cd', (req, res) => {
  res.send('ab?cd')
})

// Matches 'abcd', 'abbcd', 'abbbcd' and so on
app.get('/ab+cd', (req, res) => {
  res.send('ab+cd')
})

// Matches 'abcd', 'abRANDOMcd' and so on
app.get('/ab*cd', (req, res) => {
  res.send('ab*cd')
})

// Matches 'abe' and 'abcde'
app.get('/ab(cd)?e', (req, res) => {
  res.send('ab(cd)?e')
})

// Regex in URL:
// Matches anything with "a" in it
app.get(/a/, (req, res) => {
  res.send('/a/')
})

// Matches 'dragonfly' and 'butterfly'
app.get(/.*fly$/, (req, res) => {
  res.send('/.*fly$/')
})

// Array of URLs:
// Matches paths starting with the passed strings
app.use(['/abcd', '/xyza', /\/lmn|\/pqr/], function (req, res, next) {
  res.send('Hello World')
})

// Callback function:
app.get('/example/b', (req, res, next) => {
  console.log('the response will be sent by the next function ...')
  next()
}, (req, res) => {
  res.send('Hello from B!')
})

// Array of callback functions:
const cb0 = function (req, res, next) {
  console.log('CB0')
  next()
}

const cb1 = function (req, res, next) {
  console.log('CB1')
  next()
}

const cb2 = function (req, res) {
  res.send('Hello from C!')
}

app.get('/example/c', [cb0, cb1, cb2])

// Combination of arrays and independent functions:
const c2b0 = function (req, res, next) {
  console.log('C2B0')
  next()
}

const c2b1 = function (req, res, next) {
  console.log('C2B1')
  next()
}

app.get('/example/d', [c2b0, c2b1], (req, res, next) => {
  console.log('the response will be sent by the next function ...')
  next()
}, (req, res) => {
  res.send('Hello from D!')
})

// Chainable route handler:
app.route('/book')
    .get((req, res) => {
      res.send('Get a random book')
    })
    .post((req, res) => {
      res.send('Add a book')
    })
    .put((req, res) => {
      res.send('Update the book')
    })

// Serving static files:
app.use('/static', express.static(path.join(__dirname, 'public')));

// File upload:
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
  res.send('File uploaded');
});

// Redirect:
app.get('/redirect', (req, res) => {
  res.redirect('/');
});

// Cookies:
app.get('/set-cookie', (req, res) => {
  res.cookie('name', 'Express').send('Cookie set');
});

app.get('/get-cookie', (req, res) => {
  const name = req.cookies.name;
  res.send(`Cookie: ${name}`);
});

// Sessions:
app.get('/set-session', (req, res) => {
  req.session.name = 'Express';
  res.send('Session set');
});

app.get('/get-session', (req, res) => {
  const name = req.session.name;
  res.send(`Session: ${name}`);
});

// Content negotiation:
app.get('/content', (req, res) => {
  res.format({
    'text/plain': () => {
      res.send('Hello Text!');
    },
    'text/html': () => {
      res.send('<p>Hello HTML!</p>');
    },
    'application/json': () => {
      res.send({ message: 'Hello JSON!' });
    },
    default: () => {
      res.status(406).send('Not Acceptable');
    },
  });
});

// Route modularization:
app.use(require('./routes/exampleRoutes'));

// Route grouping - group related routes using the Express Router:
const userRouter = express.Router();

userRouter.get('/users', (req, res) => {
  res.send('Get users');
});

userRouter.post('/users', (req, res) => {
  res.send('Post users');
});

app.use('/api', userRouter);

// Template engines - render an EJS template:
app.get('/template', (req, res) => {
  res.render('template', { title: 'EJS Template', message: 'Hello from EJS' });
});

// Content types:
app.get('/ct1', (req, res) => {
  res.json(null)
  res.json({ user: 'tobi' })
  res.status(500).json({ error: 'message' })
})

app.get('/ct2', (req, res) => {
  res.jsonp({ user: 'tobi' })
  res.status(500).jsonp({ error: 'message' })
})

app.get('/ct3', (req, res) => {
  res.set('Content-Type', 'text/html')
  res.send(Buffer.from('<p>some html</p>'))
})

app.get('/ct4', (req, res) => {
  res.append('Content-Type', 'text/html')
  res.send(Buffer.from('<p>some html</p>'))
})

app.get('/ct5', (req, res) => {
  res.type('.html')
  res.send(Buffer.from('<p>some html</p>'))
})

app.get('/ct6', (req, res) => {
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
app.get('/sc1', (req, res) => {
  res.sendStatus(404)
})

app.get('/sc2', (req, res) => {
  res.status(400).send('Bad Request')
})

// Command injection:
app.get('/api/run-command', (req, res) => {
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
app.get('/api/log-forging', (req, res) => {
  const user = req.query.user;
  const logEntry = `User ${user} accessed the API.`;

  // Vulnerability: Log Forging
  // Here, we're directly concatenating user input into the log message without proper validation or sanitization.
  // An attacker can manipulate the "user" query parameter to inject special characters or newline characters,
  // potentially creating forged log entries or even executing arbitrary code in some cases.

  console.log(logEntry); // Logging the potentially manipulated log entry

  return res.status(200).json({ message: 'Log entry created' });
});

// Middleware for error handling:
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});