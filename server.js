const express = require('express');
const postsRoute = require('./posts/postsRoute.js');

const server = express();
server.use(express.json());

server.use('/api/posts', postsRoute)

server.use('/', (req, res) => {
    res.send(`
        <h2>Server is Running</h2>
    `);
});

module.exports = server;