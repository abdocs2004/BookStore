import mongoose from "mongoose";
import { Book } from "../models/BookStore.js";

function handleError(res, error) {
    if (error.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    console.error(error);
    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
}

export async function getBooks(req, res) {
    try {
        const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
        const skip = (page - 1) * limit;
        const [books, total] = await Promise.all([
            Book.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Book.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            data: books,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        handleError(res, error);
    }
}

export async function getBook(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid book ID" });
        }

        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        res.status(200).json({ success: true, data: book });
    } catch (error) {
        handleError(res, error);
    }
}

export async function createBook(req, res) {
    try {
        const book = await Book.create(req.body);
        res.status(201).json({ success: true, data: book });
    } catch (error) {
        handleError(res, error);
    }
}

export async function updateBook(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid book ID" });
        }

        const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        res.status(200).json({ success: true, data: book });
    } catch (error) {
        handleError(res, error);
    }
}

export async function deleteBook(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid book ID" });
        }

        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        res.status(200).json({ success: true, message: "Book deleted successfully" });
    } catch (error) {
        handleError(res, error);
    }
}
