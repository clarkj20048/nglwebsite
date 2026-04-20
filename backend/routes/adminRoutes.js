const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const Message = require("../models/Message");
const { requireAdminAuth } = require("../middleware/authMiddleware");
const { validateAdminLoginPayload } = require("../utils/validation");

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const { sanitized, errors, isValid } = validateAdminLoginPayload(req.body);

    if (!isValid) {
      const error = new Error("Validation failed");
      error.statusCode = 400;
      error.details = errors;
      throw error;
    }

    if (!process.env.JWT_SECRET) {
      const error = new Error("JWT_SECRET environment variable is required.");
      error.statusCode = 500;
      throw error;
    }

    const admin = await Admin.findOne({ username: sanitized.username });

    if (!admin) {
      const error = new Error("Invalid credentials.");
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(sanitized.password, admin.password);

    if (!isPasswordValid) {
      const error = new Error("Invalid credentials.");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
        username: admin.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/messages", requireAdminAuth, async (_req, res, next) => {
  try {
    const messages = await Message.find()
      .populate({ path: "profileId", select: "profileImage", options: { lean: true } })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      messages: messages.map((message) => ({
        _id: message._id,
        fullName: message.fullName,
        anonymousName: message.anonymousName,
        message: message.message,
        createdAt: message.createdAt,
        profileId: message.profileId?._id || null,
        profileImage: message.profileId?.profileImage || "",
      })),
    });
  } catch (error) {
    return next(error);
  }
});

router.delete("/messages/:id", requireAdminAuth, async (req, res, next) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(req.params.id);

    if (!deletedMessage) {
      const error = new Error("Message not found.");
      error.statusCode = 404;
      throw error;
    }

    return res.json({ message: "Message deleted successfully." });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
