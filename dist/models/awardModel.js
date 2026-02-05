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
const mongoose_1 = __importStar(require("mongoose"));
const photoModel_1 = require("./photoModel");
const awardPostSchema = new mongoose_1.Schema({
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
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Please add a category"],
        validate: {
            validator: async function (value) {
                const CategoryModel = mongoose_1.default.model("Category");
                const category = await CategoryModel.findOne({
                    _id: value,
                    type: "award",
                });
                return !!category;
            },
            message: "Invalid award category",
        },
    },
    images: {
        type: [photoModel_1.imageSchema],
        required: [true, "At least one image is required"],
        validate: {
            validator: function (images) {
                return images && images.length > 0 && images.length <= 10; // Max 10 images
            },
            message: "Must have between 1 and 10 images",
        },
    },
}, {
    timestamps: true,
});
// Indexes for better query performance
awardPostSchema.index({ category: 1 });
awardPostSchema.index({ createdAt: -1 });
const AwardPostModel = mongoose_1.default.model("awardPost", awardPostSchema);
exports.default = AwardPostModel;
