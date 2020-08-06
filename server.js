import express from "express";
import bodyParser from "body-parser";
import routes from "./routes/index";
import controller from "./controllers/controller";
const swaggerUi = require("swagger-ui-express");
const docs = require("./docs");
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
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(docs));
app.use("/api", routes);

const server = http.createServer(app);
const io = socketIO(server);

let sockets = [];
io.on("connection", socket => {
  console.log("socket connected", socket.id);
  socket
    .on("add", async ({ hash, newAttendee }) => {
      console.log("addition request ", { hash, newAttendee });
      if (await controller.saveAndNotify({ hash, newAttendee }))
        socket.emit("adding");
      else socket.emit("addition failed");
    })
    .on("update", ({ oldAttendee, updatedAttendee }) => {
      if (controller.updateAttendee(oldAttendee, updatedAttendee))
        socket.emit("updated");
      else socket.emit("update failed");
    })
    .on("delete", ({ attendeeTemp }) => {
      if (controller.deleteAttendee(attendeeTemp)) socket.emit("deleted");
      else socket.emit("deletion error");
    })
    .on("disconnect", () => {
      console.log("socket disconnected", socket.id);
      if (socket.hash) {
        let index = sockets.indexOf(socket);
        if (index) sockets.splice(index, 1);
      }
    })
    .on("hash", ({ hash }) => {
      socket.hash = hash;
      sockets.push(socket);
      controller.getAttendees(hash);
    });
});
controller
  .on("send attendees", attendees => {
    let targets = sockets.filter(socket => {
      return socket.hash === attendees[0].hash;
    });
    targets.map(socket => {
      socket.emit("attendees", attendees);
      console.log(`sent attendees: ${attendees} to ${socket.id}`);
    });
  })
  .on("send attendee", attendee => {
    let targets = sockets.filter(socket => {
      return socket.hash === attendee.hash;
    });
    targets.map(socket => {
      socket.emit(attendee.hash, attendee);
      console.log(
        `sent attendee: ${(attendee.hash, attendee)} to ${socket.id}`
      );
    });
  });

setInterval(
  sockets => {
    if (sockets.length > 0) {
      console.log(
        `disconnecting socket ${sockets[0].id} due to exceeding the time limit`
      );
      sockets[0].disconnect();
      sockets.shift();
    }
  },
  2100000, // disconnect idle sockets after 35 mins
  sockets
);

// create a server using port 8888
const PORT = process.env.PORT || 8888;
server.listen(PORT, () => {
  console.log("server is running on port " + PORT);
  console.log("using environment: ", process.env.NODE_ENV);
});

module.exports = server;
