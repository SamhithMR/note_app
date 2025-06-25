require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDb = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const noteRoutes = require("./routes/notes.routes");
const aiRoutes = require("./routes/ai.routes");

const app = express();
const PORT = process.env.PORT || 3000;

connectDb();
app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req, res) => res.send("Server running..."));


app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/ai", aiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
