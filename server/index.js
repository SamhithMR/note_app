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

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const accessToken = jwt.sign({ user: { _id: user._id, email: user.email } }, JWT_SECRET, {
        expiresIn: "36000m",
      });

      return res.json({
        error: false,
        message: "Login Successful",
        email: user.email,
        accessToken,
      });
    } else {
      return res.status(400).json({ error: true, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

app.get("/get-user", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const isUser = await User.findOne({ _id: user._id });

  if (!isUser) {
    return res.status(401);
  }
  return res.json({
    //   user: user,
    user: {
      fullName: isUser.fullName,
      email: isUser.email,
      _id: isUser._id,
      createdOn: isUser.createdOn,
    },
    message: "User found",
  });
});

app.post("/add-note", authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const { user } = req.user;

  if (!title) {
    return res.status(400).json({ error: true, message: "Title is required" });
  }

  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: "Content is required" });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });

    await note.save();

    return res.json({ error: false, note, message: "Note added successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

app.get("/get-all-notes/", authenticateToken, async (req, res) => {
  const { user } = req.user;

  try {
    const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });

    return res.json({
      error: false,
      notes,
      message: "All notes retrived successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
