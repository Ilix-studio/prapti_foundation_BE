"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/testimonialModel.ts
const mongoose_1 = __importStar(require("mongoose"));
const testimonialSchema = new mongoose_1.Schema({
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
            validator: function (v) {
                return Number.isInteger(v) || v % 0.5 === 0;
            },
            message: "Rating must be a whole number or half number (e.g., 4.5)",
        },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            return ret;
        },
    },
});
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
const TestimonialModel = mongoose_1.default.model("Testimonial", testimonialSchema);
exports.default = TestimonialModel;
