// models/blogPostModel.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IBlogPost extends Document {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  image: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Please add content"],
    },
    excerpt: {
      type: String,
      required: [true, "Please add an excerpt"],
      maxlength: [500, "Excerpt cannot be more than 500 characters"],
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
      enum: [
        "Adoption Stories",
        "Dog Care",
        "Training Tips",
        "Shelter News",
        "Health & Wellness",
        "Rescue Stories",
      ],
    },
    image: {
      type: String,
    },
    author: {
      type: String,
      required: [true, "Please add an author"],
      default: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

const BlogPost = mongoose.model<IBlogPost>("BlogPost", blogPostSchema);
export default BlogPost;
