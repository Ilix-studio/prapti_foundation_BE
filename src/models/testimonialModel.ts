// src/models/testimonialModel.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ITestimonial extends Document {
  quote: string;
  name: string;
  profession: string;
  rate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    quote: {
      type: String,
      required: [true, "Quote is required"],
      trim: true,
      minlength: [10, "Quote must be at least 10 characters long"],
      maxlength: [1000, "Quote cannot exceed 1000 characters"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    profession: {
      type: String,
      required: [true, "Profession is required"],
      trim: true,
      minlength: [2, "Profession must be at least 2 characters long"],
      maxlength: [150, "Profession cannot exceed 150 characters"],
    },
    rate: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      validate: {
        validator: function (v: number) {
          return Number.isInteger(v) || v % 0.5 === 0;
        },
        message: "Rating must be a whole number or half number (e.g., 4.5)",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

// Create indexes for better query performance
testimonialSchema.index({ rate: -1 });
testimonialSchema.index({ createdAt: -1 });
testimonialSchema.index({ isActive: 1 });

// Add text search index for quote and name
testimonialSchema.index({
  quote: "text",
  name: "text",
  profession: "text",
});

const TestimonialModel = mongoose.model<ITestimonial>(
  "Testimonial",
  testimonialSchema
);

export default TestimonialModel;
