require("dotenv").config();
const prisma = require("./config/db");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const socketAuth = require("./utils/socket");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const sessionRoutes = require("./routes/session.routes");

const app = express();

const server = http.createServer(app);
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
    },
});


io.use(socketAuth);
const sessionCodeMap = {};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join session room
    socket.on("join-room", (roomId) => {
        socket.join(roomId);
        const role = socket.user.role;
        console.log("Joined room:", roomId);
        const clients = io.sockets.adapter.rooms.get(roomId);
        if (role === "MENTOR") {
            socket.emit("init", { isCaller: true });
        } else {
            socket.emit("init", { isCaller: false });

            // notify mentor to start
            socket.to(roomId).emit("start-call");
        }

        if (clients) {
            const users = Array.from(clients);

            if (users.length === 1) {
                // First user = caller
                socket.emit("init", { isCaller: true });
            }
        }
    });

    // 🔥 OFFER (caller → receiver)
    socket.on("offer", ({ roomId, offer }) => {
        socket.to(roomId).emit("offer", offer);
    });

    // 🔥 ANSWER (receiver → caller)
    socket.on("answer", ({ roomId, answer }) => {
        socket.to(roomId).emit("answer", answer);
    });

    // 🔥 ICE CANDIDATES
    socket.on("ice-candidate", ({ roomId, candidate }) => {
        socket.to(roomId).emit("ice-candidate", candidate);
    });

    // 🔥 SEND MESSAGE
    socket.on("send-message", ({ sessionId, content }) => {
        io.to(sessionId).emit("receive-message", {
            content,
            sessionId,
            senderId: socket.user.userId,
        });
    });


    // CODE SYNC
    socket.on("code-change", ({ sessionId, code }) => {
        // 🧠 Last-write-wins strategy
        sessionCodeMap[sessionId] = code;
        socket.to(sessionId).emit("code-update", code);
    });

    socket.on("cursor-move", (data) => {
        socket.to(data.sessionId).emit("cursor-update", data.position);
    });

    // 🔥 DISCONNECT
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });

});


// ✅ Middlewares
// app.use(cors());
app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);


app.get("/", (req, res) => {
    res.send("API is running...");
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

