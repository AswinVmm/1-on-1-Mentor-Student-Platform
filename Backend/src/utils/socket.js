const jwt = require("jsonwebtoken");

const socketAuth = (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) return next(new Error("No token"));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("DECODED:", decoded); // 🔥 DEBUG

        socket.user = {
            userId: decoded.id,
            role: decoded.role,
        }

        next();
    } catch (err) {
        next(new Error("Invalid token"));
    }
};

module.exports = socketAuth;