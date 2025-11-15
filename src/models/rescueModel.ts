import mongoose, { Document, Schema } from "mongoose";
import { IImage, imageSchema } from "./photoModel";

export interface IRescuePost extends Document {
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  createdAt: Date;
  updatedAt: Date;
}

const rescuePostSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add content"],
    },

    beforeImage: {
      type: String,
      required: true,
    },
    afterImage: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
rescuePostSchema.index({ category: 1 });
rescuePostSchema.index({ createdAt: -1 });

const RescuePostModel = mongoose.model<IRescuePost>(
  "rescuePost",
  rescuePostSchema
);
export default RescuePostModel;
