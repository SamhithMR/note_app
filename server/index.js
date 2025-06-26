require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDb = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const noteRoutes = require("./routes/notes.routes");
const aiRoutes = require("./routes/ai.routes");

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

connectDb();
app.use(express.json());

app.get("/", (req, res) => res.send("Server running..."));


app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/ai", aiRoutes);

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

io.on("connection", (socket) => {
  socket.on("note-updated", (note) => {
    console.log(note)
    socket.broadcast.emit("note-updated-from-server", note);
  });

  socket.on("note-deleted", (noteId) => {
    socket.broadcast.emit("note-deleted-from-server", noteId);
  });
});

server.listen(PORT, () => {
  console.log(`server is running`);
});
