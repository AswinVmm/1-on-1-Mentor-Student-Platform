require("dotenv").config();
// console.log("DATABASE_URL =", process.env.DATABASE_URL);
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");

const app = express();
const userRoutes = require("./routes/user.routes");

app.use("/api/users", userRoutes);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("API is running...");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

