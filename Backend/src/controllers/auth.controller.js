const supabase = require("../config/supabase");
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
                supabaseId: data.user.id,
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

        // 1. Login via Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(400).json({ message: error.message });
        }

        // 2. Get role from DB
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // 3. Create custom JWT (for your backend)
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                supabaseId: data.user.id,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            token,
            role: user.role,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// SIGNUP
exports.register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        // 1. Create user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) return res.status(400).json({ error: error.message });

        // 2. Store extra data in DB (Prisma)
        const user = await prisma.user.create({
            data: {
                email,
                name,
                role, // mentor / student
                supabaseId: data.user.id,
            },
        });

        res.status(201).json({
            message: "User registered",
            user,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};