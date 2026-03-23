const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

// Only logged-in users
router.get("/profile", authMiddleware, (req, res) => {
    res.json({ message: "User profile accessed", user: req.user });
});

// Only mentors
router.get(
    "/mentor",
    authMiddleware,
    authorizeRoles("mentor"),
    (req, res) => {
        res.json({ message: "Mentor dashboard" });
    }
);

// Only students
router.get(
    "/student",
    authMiddleware,
    authorizeRoles("student"),
    (req, res) => {
        res.json({ message: "Student dashboard" });
    }
);

module.exports = router;