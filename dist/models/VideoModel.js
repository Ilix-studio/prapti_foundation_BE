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
// src/models/VideoModel.ts
const mongoose_1 = __importStar(require("mongoose"));
const videoSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        maxlength: [200, "Title cannot exceed 200 characters"],
        index: true,
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
        maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    thumbnail: {
        type: String,
        required: [true, "Thumbnail URL is required"],
        validate: {
            validator: function (v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: "Thumbnail must be a valid URL",
        },
    },
    videoUrl: {
        type: String,
        required: [true, "Video URL is required"],
        validate: {
            validator: function (v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: "Video URL must be a valid URL",
        },
    },
    date: {
        type: Date,
        required: [true, "Date is required"],
        index: true,
    },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Category is required"],
        validate: {
            validator: async function (value) {
                const CategoryModel = mongoose_1.default.model("Category");
                const category = await CategoryModel.findOne({
                    _id: value,
                    type: "video",
                });
                return !!category;
            },
            message: "Invalid video category",
        },
    },
    duration: {
        type: String,
        required: [true, "Duration is required"],
        validate: {
            validator: function (v) {
                return /^\d{1,2}:\d{2}(:\d{2})?$/.test(v);
            },
            message: "Duration must be in format MM:SS or HH:MM:SS",
        },
    },
    publicId: {
        type: String,
        required: [true, "Cloudinary public ID is required"],
        unique: true,
        index: true,
    },
    thumbnailPublicId: {
        type: String,
        index: true,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
}, {
    timestamps: true,
});
// Compound indexes for efficient queries
videoSchema.index({ category: 1, date: -1 });
videoSchema.index({ isActive: 1, date: -1 });
videoSchema.index({ title: "text", description: "text" });
const VideoModel = mongoose_1.default.models.Video || mongoose_1.default.model("Video", videoSchema);
exports.default = VideoModel;
