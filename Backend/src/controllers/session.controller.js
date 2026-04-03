const prisma = require("../config/db");
const crypto = require("crypto");
// const { v4: uuidv4 } = require("uuid");

// CREATE SESSION (Mentor)
exports.createSession = async (req, res) => {
    try {
        const { title, description } = req.body;

        const session = await prisma.session.create({
            data: {
                title,
                description,
                mentorId: req.user.userId,
                joinCode: crypto.randomUUID(),
                status: "active",
                // joinCode: uuidv4(),
            },
        });

        const nodemailer = require("nodemailer");

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS,
            },
        });
        try {
            // Send email
            await transporter.sendMail({
                from: process.env.EMAIL,
                to: "student@email.com", // 🔥 later fetch from DB
                subject: "New Session Created",
                text: `Join here: ${process.env.FRONTEND_URL}/session/${session.joinCode}`,
            });
        } catch (emailErr) {
            console.log("EMAIL failed:", emailErr.message);
        }

        res.json({
            message: "Session created",
            session,
            code: session.joinCode,
            joinLink: `${process.env.FRONTEND_URL}/session/${session.joinCode}`,
        });
    } catch (err) {
        console.log("CREATE SESSION ERROR:", err.message);
        res.status(500).json({ message: err.message });
    }
};

// JOIN SESSION (Student)
exports.joinSession = async (req, res) => {
    try {
        const { code } = req.params;

        const session = await prisma.session.findUnique({
            where: { joinCode: code },
        });

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        if (session.studentId) {
            return res.status(400).json({ message: "Session already taken" });
        }

        const updated = await prisma.session.update({
            where: { joinCode: code },
            data: {
                studentId: req.user.userId,
                status: "active",
            },
        });

        res.json({
            message: "Joined session",
            session: updated,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// END SESSION (Mentor only)
exports.endSession = async (req, res) => {
    try {
        const { id } = req.params;

        const session = await prisma.session.findUnique({
            where: { id },
        });

        if (session.mentorId !== req.user.userId) {
            return res.status(403).json({ message: "Not allowed" });
        }

        const updated = await prisma.session.update({
            where: { id },
            data: { status: "ended" },
        });

        res.json({
            message: "Session ended",
            session: updated,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET ACTIVE SESSIONS
exports.getActiveSessions = async (req, res) => {
    try {
        const sessions = await prisma.session.findMany({
            where: { status: "active" },
            select: {
                title: true,
                joinCode: true,
                id: true,
            },
        });

        res.json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};