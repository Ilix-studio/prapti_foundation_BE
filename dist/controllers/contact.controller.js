"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = exports.markAsRead = exports.getMessageById = exports.getMessages = exports.sendMessage = void 0;
// src/controllers/contact.controller.ts
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const contactModel_1 = __importDefault(require("../models/contactModel"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * @desc    Create new contact message
 * @route   POST /api/contact/send
 * @access  Public
 */
exports.sendMessage = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { name, email, subject, message } = req.body;
    // Validation
    if (!name || !email || !subject || !message) {
        res.status(400).json({
            success: false,
            message: "All fields are required",
        });
        return;
    }
    // Create contact message
    const contactMessage = await contactModel_1.default.create({
        name,
        email,
        subject,
        message,
    });
    logger_1.default.info(`New contact message received from: ${email}`);
    res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: {
            id: contactMessage._id,
            name: contactMessage.name,
            email: contactMessage.email,
            subject: contactMessage.subject,
            createdAt: contactMessage.createdAt,
        },
    });
});
/**
 * @desc    Get all contact messages
 * @route   GET /api/contact/messages
 * @access  Private (Admin only)
 */
exports.getMessages = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { page = 1, limit = 10, read } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    // Build filter query
    let filter = {};
    if (read !== undefined) {
        filter.isRead = read === "true";
    }
    const messages = await contactModel_1.default.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber);
    const totalMessages = await contactModel_1.default.countDocuments(filter);
    const unreadCount = await contactModel_1.default.countDocuments({ isRead: false });
    res.status(200).json({
        success: true,
        data: messages,
        pagination: {
            current: pageNumber,
            pages: Math.ceil(totalMessages / limitNumber),
            total: totalMessages,
            limit: limitNumber,
        },
        unreadCount,
    });
});
/**
 * @desc    Get single contact message by ID
 * @route   GET /api/contact/messages/:id
 * @access  Private (Admin only)
 */
exports.getMessageById = (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a;
    const { id } = req.params;
    if (!id) {
        res.status(400).json({
            success: false,
            message: "Message ID is required",
        });
        return;
    }
    const message = await contactModel_1.default.findById(id);
    if (!message) {
        res.status(404).json({
            success: false,
            message: "Message not found",
        });
        return;
    }
    // Mark as read when viewed
    if (!message.isRead) {
        message.isRead = true;
        await message.save();
        logger_1.default.info(`Message marked as read: ${message._id} by ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.email}`);
    }
    res.status(200).json({
        success: true,
        data: message,
    });
});
/**
 * @desc    Mark message as read/unread
 * @route   PATCH /api/contact/messages/:id/read
 * @access  Private (Admin only)
 */
exports.markAsRead = (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a;
    const { id } = req.params;
    const { isRead } = req.body;
    if (!id) {
        res.status(400).json({
            success: false,
            message: "Message ID is required",
        });
        return;
    }
    const message = await contactModel_1.default.findByIdAndUpdate(id, { isRead: isRead !== null && isRead !== void 0 ? isRead : true }, { new: true });
    if (!message) {
        res.status(404).json({
            success: false,
            message: "Message not found",
        });
        return;
    }
    logger_1.default.info(`Message ${isRead ? "marked as read" : "marked as unread"}: ${message._id} by ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.email}`);
    res.status(200).json({
        success: true,
        message: `Message ${isRead ? "marked as read" : "marked as unread"}`,
        data: message,
    });
});
/**
 * @desc    Delete contact message
 * @route   DELETE /api/contact/messages/:id
 * @access  Private (Admin only)
 */
exports.deleteMessage = (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a;
    const { id } = req.params;
    if (!id) {
        res.status(400).json({
            success: false,
            message: "Message ID is required",
        });
        return;
    }
    const message = await contactModel_1.default.findById(id);
    if (!message) {
        res.status(404).json({
            success: false,
            message: "Message not found",
        });
        return;
    }
    await contactModel_1.default.findByIdAndDelete(id);
    logger_1.default.info(`Contact message deleted: ${message.email} by ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.email}`);
    res.status(200).json({
        success: true,
        message: "Message deleted successfully",
    });
});
