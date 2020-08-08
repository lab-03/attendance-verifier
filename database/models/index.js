import configJson from "../config/config";
import mongoose, { mongo } from "mongoose";

const env = process.env.NODE_ENV;

const config = configJson[env];

mongoose.connect(config.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  // we're connected!
  console.log("connected to database");
});
export default db;
