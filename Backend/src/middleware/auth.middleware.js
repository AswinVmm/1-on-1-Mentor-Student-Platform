const jwt = require("jsonwebtoken");
// console.log("JWT_SECRET:", process.env.JWT_SECRET);
const authMiddleware = (req, res, next) => {
    try {
        console.log("HEADERS:", req.headers.authorization);
        const token = req.headers.authorization?.split(" ")[1];
        console.log("TOKEN:", token);

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("DECODED:", decoded);

        req.user = decoded; // { userId: ... }

        next();
    } catch (error) {
        console.log("ERROR:", error.message);
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;