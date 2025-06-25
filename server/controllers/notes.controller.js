const Note = require("../models/note-model");

exports.addNote = async (req, res) => {
  const { title, content, x, y } = req.body;
  const { user } = req.user;

  if (!title || !content) {
    return res.status(400).json({ error: true, message: "Title and content are required" });
  }

  try {
    const note = new Note({
      title,
      content,
      userId: user._id,
      x,
      y,
    });

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note added successfully",
    });
  } catch (error) {
    console.error("Add Note Error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

exports.getAllNotes = async (req, res) => {
  const { user } = req.user;

  try {
    const notes = await Note.find({ userId: user._id });

    return res.json({
      error: false,
      notes,
      message: "All notes retrieved successfully",
    });
  } catch (error) {
    console.error("Get All Notes Error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

exports.editNote = async (req, res) => {
  const { noteId } = req.params;
  const { title, content } = req.body;
  const { user } = req.user;

  if (!title && !content) {
    return res.status(400).json({ error: true, message: "No changes provided" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
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
    console.error("Edit Note Error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

exports.updateNotePosition = async (req, res) => {
  const { noteId } = req.params;
  const { x, y } = req.body;
  const { user } = req.user;

  if (x === undefined || y === undefined) {
    return res.status(400).json({ error: true, message: "Position data required" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
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
    console.error("Update Note Position Error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

exports.deleteNote = async (req, res) => {
  const { noteId } = req.params;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    await Note.deleteOne({ _id: noteId, userId: user._id });

    return res.json({
      error: false,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete Note Error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

exports.searchNotes = async (req, res) => {
  const { user } = req.user;
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: true, message: "Search query is required" });
  }

  try {
    const notes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    });

    return res.json({
      error: false,
      notes,
      message: "Notes matching the search query retrieved successfully",
    });
  } catch (error) {
    console.error("Search Notes Error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
