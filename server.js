import express from "express";
import bodyParser from "body-parser";
import routes from "./routes/index";
var http = require("http");
var cors = require("cors");

// This line is from the Node.js HTTPS documentation.
// var options = {};

const app = express();
app.use(cors());

// Configure app to user bodyParser & the routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/api", routes);

// create a server using port 5000
const PORT = process.env.PORT || 8888;
http.createServer(app).listen(PORT, () => {
  console.log("server is running on port " + PORT);
});
