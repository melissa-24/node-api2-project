const express = require("express");
const cors = require("cors");

const postsRoute = require("./posts/postsRoute");

const server = express();
server.use(express.json());
server.use(cors());

server.use("/api/posts", postsRoute);


server.get('/', (req, res) => {
    res.send(`Server is up and running`);
});

module.exports = server;