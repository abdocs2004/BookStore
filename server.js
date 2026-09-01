import "dotenv/config";
import express from "express";
import connectDB from "./models/BookStore.js";
import booksRoutes from "./Routes/books.routes.js";
import usersRoutes from "./Routes/users.route.js";
import {
    welcome,
    about,
    image
} from "./Controller/generalController.js";
import notFound from "./middleware/notFound.js";

const app = express();

app.route("/").get((req, res) => {
    res.sendFile("public/index.html", { root: process.cwd() });
});
app.use(express.static("public"));
app.get("/api", welcome);

app.use("/books", booksRoutes);
app.use("/", usersRoutes);

app.use(notFound);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
