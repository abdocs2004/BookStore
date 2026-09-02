import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

    if (!token) {
        return res.status(401).json({ success: false, message: "Authentication token is required" });
    }

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured");
        }
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
}

export function requireAdmin(req, res, next) {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ success: false, message: "Admin access required" });
    }
    next();
}