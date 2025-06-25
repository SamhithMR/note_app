const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require("../controllers/auth.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

router.post("/create-account", registerUser);
router.post("/login", loginUser);
router.get("/get-user", authenticateToken, getUserProfile);

module.exports = router;
