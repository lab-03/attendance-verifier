import express from "express";
import bodyParser from "body-parser";
import routes from "./routes/index";
var http = require("http");
var cors = require("cors");

// This line is from the Node.js HTTPS documentation.
// var options = {};

const server = express();
server.use(cors());

// Configure server to user bodyParser & the routes
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use("/api/qrcodes", routes);

// create a server using port 5000
const PORT = process.env.PORT || 8888;
server.listen(PORT, () => {
  console.log("server is running on port " + PORT);
});

module.exports = server;
