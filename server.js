import express from "express";
import bodyParser from "body-parser";
import routes from "./routes/index";
import controller from "./controllers/controller";
const socketIO = require("socket.io");
const http = require("http");
const cors = require("cors");

// This line is from the Node.js HTTPS documentation.
// var options = {};

// Configure server to user bodyParser & the routes
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/api", routes);

const server = http.createServer(app);
const io = socketIO(server);

io.on("connection", socket => {
  console.log("socket connected");
  controller.on("send attendee", ({ attendee }) => {
    socket.emit(attendee.hash, attendee);
    console.log("sent:", attendee.hash, attendee);
  });
});

// create a server using port 8888
const PORT = process.env.PORT || 8888;
server.listen(PORT, () => {
  console.log("server is running on port " + PORT);
});

module.exports = server;
