const express = require("express");
const router = express.Router();
const { enhanceNote } = require("../controllers/ai.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

router.post("/enhance", authenticateToken, enhanceNote);

module.exports = router;
