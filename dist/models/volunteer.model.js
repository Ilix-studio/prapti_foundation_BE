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
exports.VolunteerModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const VolunteerSchema = new mongoose_1.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
        maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please enter a valid email",
        ],
    },
    phone: {
        type: Number,
        required: [true, "Phone number is required"],
        trim: true,
        match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
        maxlength: [200, "Address cannot exceed 200 characters"],
    },
    district: {
        type: String,
        required: [true, "District is required"],
        trim: true,
        maxlength: [50, "District cannot exceed 50 characters"],
    },
    state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
        maxlength: [50, "State cannot exceed 50 characters"],
    },
    pincode: {
        type: Number,
        required: [true, "Pincode is required"],
        trim: true,
        maxlength: [7, "Pincode cannot exceed 7 characters"],
    },
    availability: {
        type: String,
        required: [true, "Availability is required"],
        enum: {
            values: ["weekdays", "weekends", "evenings", "flexible"],
            message: "Availability must be one of: weekdays, weekends, evenings, flexible",
        },
    },
    interests: {
        type: [String],
        required: [true, "At least one interest must be selected"],
        validate: {
            validator: function (arr) {
                return arr.length > 0;
            },
            message: "At least one area of interest is required",
        },
        enum: {
            values: [
                "Dog Walker",
                "Kennel Assistant",
                "Groomer",
                "Photographer",
                "Transport Volunteer",
                "Social Media Coordinator",
                "Event Volunteer",
                "Educational Outreach",
            ],
            message: "Invalid interest selected",
        },
    },
    experience: {
        type: String,
        trim: true,
        maxlength: [1000, "Experience description cannot exceed 1000 characters"],
    },
    reason: {
        type: String,
        required: [true, "Reason for volunteering is required"],
        trim: true,
        maxlength: [1000, "Reason cannot exceed 1000 characters"],
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });
exports.VolunteerModel = mongoose_1.default.model("Volunteer", VolunteerSchema);
