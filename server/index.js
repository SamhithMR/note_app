require("dotenv").config();

const mongoose = require("mongoose");
const connectDb = require("./config/db");
const User = require("./models/user-model");
const Note = require("./models/note-model");

const express = require('express');

const app = express();
connectDb();

app.get('/', (req, res) => {
    res.send('daa');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
