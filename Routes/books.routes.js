import express from "express";
import {
    getBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook
} from "../Controller/booksController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Get all books
router.get("/", getBooks);

// Get one book by its ID
router.get("/:id", getBook);

// Create a new book
router.post("/", authenticate, createBook);

// Update a book by its ID
router.put("/:id", updateBook);

// Delete a book by its ID
router.delete("/:id", authenticate, requireAdmin, deleteBook);

export default router;
