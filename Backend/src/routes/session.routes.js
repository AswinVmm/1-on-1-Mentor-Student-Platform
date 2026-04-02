const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const {
    createSession,
    joinSession,
    endSession,
    getActiveSessions,
} = require("../controllers/session.controller");

// Mentor creates session
router.post("/create", auth, role("MENTOR"), createSession);

// Student joins
router.post("/join/:code", auth, role("STUDENT"), joinSession);

// Mentor ends session
router.put("/end/:id", auth, role("MENTOR"), endSession);

// Anyone logged-in can see active sessions
router.get("/active", auth, getActiveSessions);

module.exports = router;