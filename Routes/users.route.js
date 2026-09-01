import express from "express";
import {
    createUser,
    loginUser,
    getAllUsers
} from "../Controller/usersController.js";

const router = express.Router();

// create a new user
router.post("/register", createUser);

// login a user
router.post("/login", loginUser);

// Get all users
router.get("/users", getAllUsers);

export default router;
