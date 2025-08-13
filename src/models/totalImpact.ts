// models/TotalImpact.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ITotalImpact extends Document {
  dogsRescued: number;
  dogsAdopted: number;
  volunteers: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const totalImpactSchema: Schema = new Schema(
  {
    dogsRescued: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    dogsAdopted: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    volunteers: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// Virtual for adoption rate
totalImpactSchema.virtual("adoptionRate").get(function (this: ITotalImpact) {
  if (this.dogsRescued === 0) return 0;
  return Math.round((this.dogsAdopted / this.dogsRescued) * 100);
});
// Index for better query performance
totalImpactSchema.index({ isActive: 1, createdAt: -1 });

export const TotalImpactModel = mongoose.model<ITotalImpact>(
  "TotalImpact",
  totalImpactSchema
);
