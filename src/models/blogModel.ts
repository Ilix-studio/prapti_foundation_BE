import mongoose, { Document, Schema } from "mongoose";

export interface IBlogPost extends Document {
  title: string;
  content: string;
  category: mongoose.Types.ObjectId;
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
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please add a category"],
      validate: {
        validator: async function (value: mongoose.Types.ObjectId) {
          const CategoryModel = mongoose.model("Category");
          const category = await CategoryModel.findOne({
            _id: value,
            type: "blogs",
          });
          return !!category;
        },
        message: "Invalid blog category",
      },
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

// Indexes for better query performance
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ createdAt: -1 });

const BlogPostModel = mongoose.model<IBlogPost>("BlogPost", blogPostSchema);
export default BlogPostModel;
