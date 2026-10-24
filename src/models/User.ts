
import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  name: string;
  email: string;
  role: "student" | "admin" | "instructor";
  isActive: boolean;
  password: string;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "admin", "instructor"],
      default: "student",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash the password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// Remove sensitive fields from JSON responses
userSchema.set("toJSON", {
  transform(_doc, ret) {
    const result = ret as Record<string, any>;

    result.id = String(result._id);
    delete result._id;
    delete result.__v;
    delete result.password;

    return result;
  },
});

export const User = model<IUser>("User", userSchema);
