const prisma = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            },
        });

        res.status(201).json({
            message: "User registered",
            user,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            token,
            user,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};