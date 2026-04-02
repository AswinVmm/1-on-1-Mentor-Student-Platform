require("dotenv").config();
const prisma = require("./config/db");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const socketAuth = require("./utils/socket");
// console.log("DATABASE_URL =", process.env.DATABASE_URL);

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const sessionRoutes = require("./routes/session.routes");

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
});

io.use(socketAuth);
const sessionCodeMap = {};
io.on("connection", (socket) => {
    console.log("User connected:", socket.user?.userId);

    // Join session room
    socket.on("join-session", async (sessionId) => {
        socket.join(sessionId);
        socket.on("join-video-room", (sessionId) => {
            socket.join(sessionId);
        });

        // 🔥 OFFER (caller → receiver)
        socket.on("offer", ({ sessionId, offer }) => {
            socket.to(sessionId).emit("offer", offer);
        });

        // 🔥 ANSWER (receiver → caller)
        socket.on("answer", ({ sessionId, answer }) => {
            socket.to(sessionId).emit("answer", answer);
        });

        // 🔥 ICE CANDIDATES
        socket.on("ice-candidate", ({ sessionId, candidate }) => {
            socket.to(sessionId).emit("ice-candidate", candidate);
        });

        // 🔥 Send previous messages
        const messages = await prisma.message.findMany({
            where: { sessionId },
            orderBy: { createdAt: "asc" },
        });

        socket.emit("chat-history", messages);

        // 🔥 System message
        socket.to(sessionId).emit("system-message", {
            content: `${socket.user.userId} joined`,
            createdAt: new Date(),
        });

        // Send existing code
        if (sessionCodeMap[sessionId]) {
            socket.emit("code-update", sessionCodeMap[sessionId]);
        }
    });

    // 🔥 SEND MESSAGE
    socket.on("send-message", ({ sessionId, content }) => {
        io.to(sessionId).emit("receive-message", {

            content,
            sessionId,
            senderId: socket.user.userId,

        });
    });

    // 🔥 DISCONNECT
    // socket.on("disconnect", () => {
    //     console.log("User disconnected");
    // });
    socket.on("end-call", (sessionId) => {
        io.to(sessionId).emit("call-ended");
    });

    // Handle code changes
    socket.on("code-change", ({ sessionId, code }) => {
        // Throttle updates to prevent excessive emissions
        const now = Date.now();
        if (!global.lastUpdateRef) global.lastUpdateRef = { current: 0 };
        if (now - global.lastUpdateRef.current < 200) return;
        global.lastUpdateRef.current = now;

        // 🧠 Last-write-wins strategy
        sessionCodeMap[sessionId] = code;

        socket.to(sessionId).emit("code-update", code);
    });

    socket.on("cursor-move", (data) => {
        socket.to(data.sessionId).emit("cursor-update", data.position);
    });

    socket.on("message", (data) => {
        console.log(data);
    });
});

// ✅ Middlewares
app.use(cors());
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

