const express = require('express');
const session = require('express-session');
const multer = require('multer');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const { exec } = require('child_process');

const app3 = express();
const port = process.env.PORT || 3000;

app3.use(cors());
app3.use(cookieParser());
app3.use(express.urlencoded({ extended: false }));
app3.use(express.json());
app3.use(session({ secret: 'superSecret', resave: false, saveUninitialized: false }));
app3.set('view engine', 'ejs');
app3.set('views', path.join(__dirname, 'views'));

// Regex in URL:
// Matches anything with "a" in it
app3.get(/a/, (req, res) => {
  res.send('/a/')
})

// Matches 'dragonfly' and 'butterfly'
app3.get(/.*fly$/, (req, res) => {
  res.send('/.*fly$/')
})

// Array of URLs:
// Matches paths starting with the passed strings
app3.use(['/abcd', '/xyza', /\/lmn|\/pqr/], function (req, res, next) {
  res.send('Hello World')
})

// Callback function:
app3.get('/example/b', (req, res, next) => {
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

app3.get('/example/c', [cb0, cb1, cb2])

// Combination of arrays and independent functions:
const c2b0 = function (req, res, next) {
  console.log('C2B0')
  next()
}

const c2b1 = function (req, res, next) {
  console.log('C2B1')
  next()
}

app3.get('/example/d', [c2b0, c2b1], (req, res, next) => {
  console.log('the response will be sent by the next function ...')
  next()
}, (req, res) => {
  res.send('Hello from D!')
})

// Chainable route handler:
app3.route('/book')
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
app3.use('/static', express.static(path.join(__dirname, 'public')));

// File upload:
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app3.post('/upload', upload.single('file'), (req, res) => {
  res.send('File uploaded');
});

// Redirect:
app3.get('/redirect', (req, res) => {
  res.redirect('/');
});

// Cookies:
app3.get('/set-cookie', (req, res) => {
  res.cookie('name', 'Express').send('Cookie set');
});

app3.get('/get-cookie', (req, res) => {
  const name = req.cookies.name;
  res.send(`Cookie: ${name}`);
});

// Sessions:
app3.get('/set-session', (req, res) => {
  req.session.name = 'Express';
  res.send('Session set');
});

app3.get('/get-session', (req, res) => {
  const name = req.session.name;
  res.send(`Session: ${name}`);
});

// Content negotiation:
app3.get('/content', (req, res) => {
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
