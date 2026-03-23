const prisma = require("../config/db");

const authorizeRoles = (...roles) => {
    return async (req, res, next) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: req.user.userId },
            });

            if (!roles.includes(user.role)) {
                return res.status(403).json({
                    message: "Access denied",
                });
            }

            next();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
};

module.exports = authorizeRoles;