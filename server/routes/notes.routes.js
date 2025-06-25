const express = require("express");
const router = express.Router();
const {
  addNote,
  getAllNotes,
  editNote,
  updateNotePosition,
  deleteNote,
  searchNotes
} = require("../controllers/notes.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

router.post("/", authenticateToken, addNote);
router.get("/", authenticateToken, getAllNotes);
router.put("/:noteId", authenticateToken, editNote);
router.put("/position/:noteId", authenticateToken, updateNotePosition);
router.delete("/:noteId", authenticateToken, deleteNote);
router.get("/search", authenticateToken, searchNotes);

module.exports = router;
