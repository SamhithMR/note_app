const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const noteSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  createdOn: {
    type: Date,
    default: new Date().getTime(),
  },
  x: { 
    type: Number, 
    default: 0 
  },
  y: { 
    type: Number, 
    default: 0 
  },
});

module.exports = mongoose.model("Note", noteSchema);
