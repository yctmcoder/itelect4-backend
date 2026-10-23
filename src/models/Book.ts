
import mongoose, { Schema } from "mongoose";

export interface IBook {
  title: string;
  author: string;
  genre: string;
  available: boolean;
  ownerId: mongoose.Types.ObjectId;
}

const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    author: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    genre: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Fantasy",
        "Fiction",
        "Mystery",
        "Romance",
        "Science Fiction",
        "Non-Fiction",
        "Biography",
        "History",
        "Other",
      ],
    },

    available: {
      type: Boolean,
      default: true,
    },

    // The user who owns this book
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Book = mongoose.model<IBook>("Book", bookSchema);
