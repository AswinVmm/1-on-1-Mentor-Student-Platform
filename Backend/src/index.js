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

            // if (users.length === 2) {
            //     // Second user = receiver
            //     socket.emit("init", { isCaller: false });

            //     // Tell caller to start
            //     socket.to(users[0]).emit("start-call");
            // }
        }
        // if (clients && clients.size === 2) {
        //     // Tell both users to start
        //     io.to(roomId).emit("ready");
        //     // const users = Array.from(clients);

        //     // // First user becomes caller
        //     // io.to(users[0]).emit("start-call", { isCaller: true });
        //     // io.to(users[1]).emit("start-call", { isCaller: false });
        // }
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
        // Throttle updates to prevent excessive emissions
        // const now = Date.now();
        // if (!global.lastUpdateRef) global.lastUpdateRef = { current: 0 };
        // if (now - global.lastUpdateRef.current < 200) return;
        // global.lastUpdateRef.current = now; now made change

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

    // socket.to(roomId).emit("user-joined");

    // 🔥 Send previous messages
    // const messages = prisma.message.findMany({
    //     where: { sessionId },
    //     orderBy: { createdAt: "asc" },
    // });

    // socket.emit("chat-history", messages);

    // 🔥 System message
    // socket.to(sessionId).emit("system-message", {
    //     content: `${socket.user.userId} joined`,
    //     createdAt: new Date(),
    // });

    // Send existing code
    // if (sessionCodeMap[sessionId]) {
    //     socket.emit("code-update", sessionCodeMap[sessionId]);
    // }
});

// socket.on("join-video-room", (sessionId) => {
//     socket.join(sessionId);
//     console.log("Joined video room:", sessionId);
// });



// socket.on("end-call", (sessionId) => {
//     io.to(sessionId).emit("call-ended");
// });

// socket.on("message", (data) => {
//     console.log(data);
// });


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

