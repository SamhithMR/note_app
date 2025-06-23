require("dotenv").config();

const mongoose = require("mongoose");
const connectDb = require("./config/db");
const User = require("./models/user-model");
const Note = require("./models/note-model");

const express = require('express');
const cors = require("cors");

const { authenticateToken } = require(".middleware/utilities");

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your access token'
const SALT_ROUNDS = 10;

const app = express();
connectDb();

app.use(express.json());
app.use(cors({origin: "*",}));

app.get('/', (req, res) => {
    res.send('daa');
});

app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName) {
    return res.status(400).json({ error: true, message: "Full Name is Required" });
  }

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is Required" });
  }

  if (!password) {
    return res.status(400).json({ error: true, message: "Password is Required" });
  }

  const isUser = await User.findOne({ email: email });
  if (isUser) {
    return res.json({ error: true, message: "Email already exists" });
  }

  try {

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = new User({
      fullName,
      email,
      password: hashedPassword, // Store the hashed password
    });

    await user.save();

    const accessToken = jwt.sign({ user: { _id: user._id, email: user.email } }, JWT_SECRET, {
      expiresIn: "36000m",
    });

    return res.json({
      error: false,
      user: { _id: user._id, fullName: user.fullName, email: user.email },
      accessToken,
      message: "User Created Successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }

})

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
