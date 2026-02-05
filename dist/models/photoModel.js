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
exports.imageSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Image schema
exports.imageSchema = new mongoose_1.Schema({
    src: {
        type: String,
        required: [true, "Image URL is required"],
        trim: true,
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
const photoSchema = new mongoose_1.Schema({
    images: {
        type: [exports.imageSchema],
        required: [true, "At least one image is required"],
        validate: {
            validator: function (images) {
                return images && images.length > 0 && images.length <= 10; // Max 10 images
            },
            message: "Must have between 1 and 10 images",
        },
    },
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        maxlength: [100, "Title cannot exceed 100 characters"],
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
                    type: "photo",
                });
                return !!category;
            },
            message: "Invalid photo category",
        },
    },
    date: {
        type: Date,
        default: Date.now,
    },
    location: {
        type: String,
        trim: true,
        maxlength: [100, "Location cannot exceed 100 characters"],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, "Description cannot exceed 500 characters"],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
// Indexes for better query performance
photoSchema.index({ category: 1 });
photoSchema.index({ date: -1 });
photoSchema.index({ isActive: 1 });
photoSchema.index({ createdAt: -1 });
const PhotoModel = mongoose_1.default.model("Photo", photoSchema);
exports.default = PhotoModel;
