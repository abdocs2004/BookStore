import "dotenv/config";
import express from "express";
import connectDB from "./models/BookStore.js";
import booksRoutes from "./Routes/books.routes.js";
import usersRoutes from "./Routes/users.route.js";
import {
    welcome
} from "./Controller/generalController.js";
import notFound from "./middleware/notFound.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files FIRST
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "public" });
});
app.get("/api", welcome);

app.use("/books", booksRoutes);
app.use("/", usersRoutes);

// Fallback to index.html for any unmatched routes
app.get("*", (req, res) => {
    res.sendFile("index.html", { root: "public" });
});

app.use(notFound);

const PORT = process.env.PORT || 3000;

await connectDB().then(() => { 
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
