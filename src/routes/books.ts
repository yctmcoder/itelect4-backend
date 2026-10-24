
import { Router, type Request, type Response } from "express";
import mongoose from "mongoose";
import { Book } from "../models/Book";
import { requireAuth } from "../middleware/auth";

export const bookRouter = Router();

// Protect all five CRUD routes
bookRouter.use(requireAuth);

// GET /api/books - Get only the logged-in user's books
bookRouter.get("/", async (req: Request, res: Response) => {
  try {
    const books = await Book.find({
      ownerId: req.userId,
    }).sort({ title: 1 });

    res.status(200).json(books);
  } catch (error) {
    console.error("Get books error:", error);
    res.status(500).json({ message: "Failed to fetch books" });
  }
});

// GET /api/books/:id - Get one owned book
bookRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid book ID" });
      return;
    }

    const book = await Book.findOne({
      _id: id,
      ownerId: req.userId,
    });

    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    res.status(200).json(book);
  } catch (error) {
    console.error("Get book error:", error);
    res.status(500).json({ message: "Failed to fetch book" });
  }
});

// POST /api/books - Create a book for the logged-in user
bookRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { title, author, genre, available } = req.body ?? {};

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof author !== "string" ||
      !author.trim() ||
      typeof genre !== "string" ||
      !genre.trim() ||
      (available !== undefined && typeof available !== "boolean")
    ) {
      res.status(400).json({
        message: "Valid title, author, genre and availability are required",
      });
      return;
    }

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      available: available ?? true,

      // Owner comes from the verified JWT, not the request body
      ownerId: req.userId,
    });

    res.status(201).json(book);
  } catch (error) {
    console.error("Create book error:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ message: error.message });
      return;
    }

    res.status(500).json({ message: "Failed to create book" });
  }
});

// PATCH /api/books/:id - Update only an owned book
bookRouter.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid book ID" });
      return;
    }

    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      res.status(400).json({ message: "Invalid update body" });
      return;
    }

    const allowedFields = ["title", "author", "genre", "available"];
    const updates: Record<string, string | boolean> = {};

    for (const [key, value] of Object.entries(req.body)) {
      if (!allowedFields.includes(key)) {
        res.status(400).json({
          message: `Field ${key} cannot be updated`,
        });
        return;
      }

      if (key === "available") {
        if (typeof value !== "boolean") {
          res.status(400).json({
            message: "available must be boolean",
          });
          return;
        }

        updates[key] = value;
      } else {
        if (typeof value !== "string" || !value.trim()) {
          res.status(400).json({
            message: `${key} must be a nonempty string`,
          });
          return;
        }

        updates[key] = value.trim();
      }
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ message: "No fields to update" });
      return;
    }

    const book = await Book.findOneAndUpdate(
      {
        _id: id,
        ownerId: req.userId,
      },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    res.status(200).json(book);
  } catch (error) {
    console.error("Update book error:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ message: error.message });
      return;
    }

    res.status(500).json({ message: "Failed to update book" });
  }
});

// DELETE /api/books/:id - Delete only an owned book
bookRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid book ID" });
      return;
    }

    const book = await Book.findOneAndDelete({
      _id: id,
      ownerId: req.userId,
    });

    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    res.status(200).json({
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Delete book error:", error);
    res.status(500).json({ message: "Failed to delete book" });
  }
});
