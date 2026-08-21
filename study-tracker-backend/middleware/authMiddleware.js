const jwt = require("jsonwebtoken");

// =====================================
// Protect Middleware
// =====================================
const protect = (req, res, next) => {
    try {

        // Get Authorization Header
        const authHeader = req.headers.authorization;

        // Check if Authorization header exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        // Extract Token
        const token = authHeader.split(" ")[1];

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user data to request
        req.user = decoded;

        next();

    } catch (error) {

        console.error("Authentication Error:", error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });

    }
};

module.exports = {
    protect
};