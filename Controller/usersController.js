import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/Users.js";

function handleError(res, error) {
    if (error.name === "ValidationError" || error.code === 11000) {
        return res.status(400).json({
            success: false,
            message: error.code === 11000 ? "Email is already registered" : error.message
        });
    }

    console.error(error);
    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
}

function createToken(user) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: "1d" });
}

function isBcryptHash(password) {
    return typeof password === "string" && /^\$2[aby]?\$\d{2}\$/.test(password);
}

export async function createUser(req, res) {
    try {
        const { name, email, password } = req.body;
        if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ success: false, message: "Name, email, and password are required" });
        }
        if (name.trim().length < 2 || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Name must be at least 2 characters and password must be at least 6 characters"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({ name, email, password: hashedPassword });
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        handleError(res, error);
    }
}

export async function loginUser(req, res) {
    try {
        const { email, password } = req.body;
        if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        let passwordMatches = false;
        if (user) {
            passwordMatches = isBcryptHash(user.password)
                ? await bcrypt.compare(password, user.password)
                : password === user.password;
        }

        if (!user || !passwordMatches) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Migrate users created before password hashing was introduced.
        if (!isBcryptHash(user.password)) {
            user.password = await bcrypt.hash(password, 12);
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token: createToken(user),
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        handleError(res, error);
    }
}

export async function getAllUsers(req, res) {
    try {
        const users = await User.find().select("-password");
        res.status(200).json({ success: true, message: "Users retrieved successfully", users });
    } catch (error) {
        handleError(res, error);
    }
}
