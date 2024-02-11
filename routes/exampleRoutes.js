const express = require('express');

const router = express.Router();

router.get('/example', (req, res) => {
    res.send('Example route');
});

// GET method route
router.get('/example/get', (req, res) => {
    res.send('GET request to the example route');
});

// POST method route
router.post('/example/post', (req, res) => {
    res.send('POST request to the example route');
});

// PUT method route
router.put('/example/put', (req, res) => {
    res.send('PUT request to the example route');
});

// DELETE method route
router.delete('/example/delete', (req, res) => {
    res.send('DELETE request to the example route');
});

// PATCH method route
router.patch('/example/patch', (req, res) => {
    res.send('PATCH request to the example route');
});

// OPTIONS method route
router.options('/example/options', (req, res) => {
    res.send('OPTIONS request to the example route');
});

// Route for any HTTP method
router.all('/example/all', (req, res) => {
    res.send(`all - ${req.method} request to the example route`);
});

module.exports = router;