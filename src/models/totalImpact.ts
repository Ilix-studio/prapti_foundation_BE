// models/TotalImpact.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ITotalImpact extends Document {
  dogsRescued: number;
  dogsAdopted: number;
  volunteers: number;
  createdAt: Date;
  updatedAt: Date;
}

const TotalImpactSchema: Schema = new Schema(
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
  },
  {
    timestamps: true,
  }
);

export const TotalImpactModel = mongoose.model<ITotalImpact>(
  "TotalImpact",
  TotalImpactSchema
);
