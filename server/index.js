require("dotenv").config();

const mongoose = require("mongoose");
const connectDb = require("./config/db");
const User = require("./models/user-model");
const Note = require("./models/note-model");
const axios = require("axios");

const express = require('express');
const cors = require("cors");

const {
  authenticateToken
} = require("./middleware/utilities");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your access token'
const SALT_ROUNDS = 10;

const app = express();
connectDb();

app.use(express.json());
app.use(cors({
  origin: "*",
}));

app.get('/', (req, res) => {
  res.send('daa');
});

app.post("/create-account", async (req, res) => {
  const {
    fullName,
    email,
    password
  } = req.body;

  if (!fullName) {
    return res.status(400).json({
      error: true,
      message: "Full Name is Required"
    });
  }

  if (!email) {
    return res.status(400).json({
      error: true,
      message: "Email is Required"
    });
  }

  if (!password) {
    return res.status(400).json({
      error: true,
      message: "Password is Required"
    });
  }

  const isUser = await User.findOne({
    email: email
  });
  if (isUser) {
    return res.json({
      error: true,
      message: "Email already exists"
    });
  }

  try {

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = new User({
      fullName,
      email,
      password: hashedPassword, // Store the hashed password
    });

    await user.save();

    const accessToken = jwt.sign({
      user: {
        _id: user._id,
        email: user.email
      }
    }, JWT_SECRET, {
      expiresIn: "36000m",
    });

    return res.json({
      error: false,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email
      },
      accessToken,
      message: "User Created Successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error"
    });
  }

})

app.post("/login", async (req, res) => {
  const {
    email,
    password
  } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required"
    });
  }

  if (!password) {
    return res.status(400).json({
      message: "Password is required"
    });
  }

  try {
    const user = await User.findOne({
      email: email
    });

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const accessToken = jwt.sign({
        user: {
          _id: user._id,
          email: user.email
        }
      }, JWT_SECRET, {
        expiresIn: "36000m",
      });

      return res.json({
        error: false,
        message: "Login Successful",
        email: user.email,
        accessToken,
      });
    } else {
      return res.status(400).json({
        error: true,
        message: "Invalid Credentials"
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error"
    });
  }
});

app.get("/get-user", authenticateToken, async (req, res) => {
  const {
    user
  } = req.user;
  const isUser = await User.findOne({
    _id: user._id
  });

  if (!isUser) {
    return res.status(401);
  }
  return res.json({
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
  const {
    title,
    content,
    x,
    y
  } = req.body;
  const {
    user
  } = req.user;

  if (!title) {
    return res.status(400).json({
      error: true,
      message: "Title is required"
    });
  }

  if (!content) {
    return res
      .status(400)
      .json({
        error: true,
        message: "Content is required"
      });
  }

  try {
    const note = new Note({
      title,
      content,
      userId: user._id,
      x,
      y
    });

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note added successfully"
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        error: true,
        message: "Internal Server Error"
      });
  }
});

app.get("/get-all-notes/", authenticateToken, async (req, res) => {
  const {
    user
  } = req.user;

  try {
    const notes = await Note.find({
      userId: user._id
    });

    return res.json({
      error: false,
      notes,
      message: "All notes retrived successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        error: true,
        message: "Internal Server Error"
      });
  }
});

app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const {
    title,
    content
  } = req.body;
  const {
    user
  } = req.user;

  if (!title && !content) {
    return res
      .status(400)
      .json({
        error: true,
        message: "No changes provided"
      });
  }

  try {
    const note = await Note.findOne({
      _id: noteId,
      userId: user._id,
    });

    if (!note) {
      return res.status(404).json({
        error: true,
        message: "Note not found"
      });
    }

    if (title) note.title = title;
    if (content) note.content = content;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {

    return res
      .status(500)
      .json({
        error: true,
        message: "Internal Server Error"
      });
  }
});

app.put("/update-note-position/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const {
    x,
    y
  } = req.body;
  const {
    user
  } = req.user;

  if (x === undefined || y === undefined) {
    return res.status(400).json({
      error: true,
      message: "Position data required"
    });
  }

  try {
    const note = await Note.findOne({
      _id: noteId,
      userId: user._id,
    });


    if (!note) {
      return res.status(404).json({
        error: true,
        message: "Note not found"
      });
    }
    note.x = x;
    note.y = y;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note position updated successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        error: true,
        message: "Internal Server Error"
      });
  }
});

app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const {
    user
  } = req.user;

  try {
    const note = await Note.findOne({
      _id: noteId,
      userId: user._id,
    });

    if (!note) {
      return res.status(404).json({
        error: true,
        message: "Note not found"
      });
    }

    await Note.deleteOne({
      _id: noteId,
      userId: user._id
    });

    return res.json({
      error: false,
      message: "Note deleted successfully",
    });
  } catch {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

app.get("/search-notes/", authenticateToken, async (req, res) => {
  const {
    user
  } = req.user;
  const {
    query
  } = req.query;

  if (!query) {
    return res
      .status(400)
      .json({
        error: true,
        message: "search query is required"
      });
  }

  try {
    const matchingNotes = await Note.find({
      userId: user._id,
      $or: [{
          title: {
            $regex: new RegExp(query, "i")
          }
        },
        {
          content: {
            $regex: new RegExp(query, "i")
          }
        },
      ],
    });

    return res.json({
      error: false,
      notes: matchingNotes,
      message: "Notes matching the search query retrived successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        error: true,
        message: "Internal Server Error"
      });
  }
});

const promptTemplates = {
  summarize: (title, content) =>
    `Summarize the note below into 1–2 sentences. Return the result strictly in JSON format like:\n{"summary": "your summary here"}\n\nTitle: ${title}\n\nContent:\n${content}`,

  improve: (title, content) =>
    `Correct grammar and typos of the note content below **without changing its meaning**. Return only the corrected content as JSON like:\n{"content": "your corrected content here"}\n\nContent:\n${content}`,

  expand: (title, content) =>
    `Expand the note by adding detailed explanations or examples. Keep it relevant and coherent. Return the result strictly in JSON format like:\n{"expanded": "your expanded note here"}\n\nTitle: ${title}\n\nNote:\n${content}`,

  custom: (title, content, customPrompt) =>
    `${customPrompt}\n\nTitle: ${title}\n\nNote:\n${content}\n\nPlease return the result strictly as a JSON object.`
};

const systemMessages = {
  summarize: "You are a summarization assistant. Return only a JSON object with key 'summary'. No extra text.",
  improve: "You are a grammar assistant. Return only a JSON object with key 'content'. No explanations or other text.",
  expand: "You are an explaining assistant. Return only a JSON object with key 'expanded'. No extra information.",
  custom: "You are a general-purpose assistant for a note-taking app. Follow user instructions and return a valid JSON object only."
};


app.post("/ai-enhance", authenticateToken, async (req, res) => {
  const {
    type,
    content,
    title = "Untitled",
    userPrompt
  } = req.body;

  if (!type || !content) {
    return res.status(400).json({
      error: true,
      message: "Missing 'type' or 'content' in request body."
    });
  }

  const templateFn = promptTemplates[type];
  const systemMessage = systemMessages[type];

  if (!templateFn || !systemMessage) {
    return res.status(400).json({
      error: true,
      message: "Invalid enhancement type."
    });
  }

  const prompt = type === "custom" ?
    templateFn(title, content, userPrompt) :
    templateFn(title, content);

  try {

    console.log({
      systemMessage,
      prompt
    })
    const aiResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions", {
        model: "deepseek/deepseek-r1:free",
        messages: [{
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: prompt
          }
        ]
      }, {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const resultKeyMap = {
      summarize: "summary",
      improve: "content",
      expand: "expanded",
      custom: "content"
    };


    const resultRaw = aiResponse.data.choices[0]?.message?.content?.trim();

    console.log({
      resultRaw
    })

    if (!resultRaw) {
      return res.status(500).json({
        error: true,
        message: "AI returned no response."
      });
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(resultRaw);
    } catch (e) {
      console.error("Failed to parse JSON from AI:", resultRaw);
      return res.status(500).json({
        error: true,
        message: "AI response not in expected format."
      });
    }

    const key = resultKeyMap[type];
    const finalContent = parsedResult?.[key];

    console.log({
      finalContent
    })

    if (!finalContent) {
      return res.status(500).json({
        error: true,
        message: "Missing expected content key in AI response."
      });
    }

    return res.json({
      error: false,
      result: finalContent,
      message: "AI enhancement successful."
    });

  } catch (err) {
    console.error("AI Enhance Error:", err.message);

    return res.status(500).json({
      error: true,
      message: "Server error while processing enhancement."
    });
  }
});



const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});