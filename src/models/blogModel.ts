import mongoose, { Document, Schema, Types } from "mongoose";

// Interface for individual image
interface IBlogsImage {
  src: string;
  alt: string;
  cloudinaryPublicId: string;
}

export interface IBlogPost extends Document {
  title: string;
  excerpt: string;
  content: string;
  category: Types.ObjectId;
  images: IBlogsImage[];
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

// Press image schema
const blogsImageSchema = new Schema<IBlogsImage>({
  src: {
    type: String,
    required: [true, "Image URL is required"],
    validate: {
      validator: function (v: string) {
        return /^https?:\/\/.+/.test(v);
      },
      message: "Image must be a valid URL",
    },
  },
  alt: {
    type: String,
    required: [true, "Alt text is required"],
    trim: true,
    maxlength: [200, "Alt text cannot exceed 200 characters"],
  },
  cloudinaryPublicId: {
    type: String,
    required: [true, "Cloudinary public ID is required"],
    trim: true,
  },
});

const blogPostSchema: Schema<IBlogPost> = new Schema(
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
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      validate: {
        validator: async function (value: mongoose.Types.ObjectId) {
          const CategoryModel = mongoose.model("Category");
          const category = await CategoryModel.findOne({
            _id: value,
            type: "photo",
          });
          return !!category;
        },
        message: "Invalid photo category",
      },
    },
    images: {
      type: [blogsImageSchema],
      required: [true, "At least one image is required"],
      validate: {
        validator: function (images: IBlogsImage[]) {
          return images && images.length > 0 && images.length <= 5; // Max 5 images for press
        },
        message: "Must have between 1 and 5 images",
      },
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
