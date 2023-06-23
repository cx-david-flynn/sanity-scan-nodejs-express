const express = require('express');
const session = require('express-session');
const multer = require('multer');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

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

// GET request with path parameters:
app.get('/path/:id', (req, res) => {
  const id = req.params.id;
  res.send(`Path parameter: ${id}`);
});

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

// Middleware for error handling:
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});