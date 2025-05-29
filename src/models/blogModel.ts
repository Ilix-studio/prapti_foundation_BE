import mongoose, { Document, Schema } from "mongoose";

export interface IBlogPost extends Document {
  title: string;
  excerpt: string;
  content: string;
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
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    excerpt: {
      type: String,
      required: [true, "Please add an excerpt"],
      trim: true,
      maxlength: [200, "Excerpt cannot be more than 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Please add content"],
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
      required: true,
    },
    author: {
      type: String,
      default: "Prapti Foundation",
    },
  },
  {
    timestamps: true,
  }
);

const BlogPostModel = mongoose.model<IBlogPost>("BlogPost", blogPostSchema);
export default BlogPostModel;
