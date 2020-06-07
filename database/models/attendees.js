import mongoose from "mongoose";

let attendeesSchema = new mongoose.Schema({
  id: Number,
  name: String,
  hash: String,
  FRScore: Number
});

let attendeesModel = mongoose.model("Attendee", attendeesSchema);

export default attendeesModel;
