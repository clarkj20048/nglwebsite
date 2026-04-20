const express = require("express");

const Message = require("../models/Message");
const Profile = require("../models/Profile");
const { validateMessagePayload } = require("../utils/validation");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { sanitized, errors, isValid } = validateMessagePayload(req.body);

    if (!isValid) {
      const error = new Error("Validation failed");
      error.statusCode = 400;
      error.details = errors;
      throw error;
    }

    let fullName = sanitized.fullName;
    let profile = null;

    if (sanitized.profileId) {
      profile = await Profile.findById(sanitized.profileId).lean();

      if (!profile) {
        const error = new Error("Profile not found.");
        error.statusCode = 404;
        throw error;
      }

      fullName = profile.fullName;
    }

    const savedMessage = await Message.create({
      fullName,
      anonymousName: sanitized.anonymousName,
      message: sanitized.message,
      profileId: profile ? profile._id : null,
    });

    return res.status(201).json({
      message: "Message submitted successfully.",
      data: {
        id: savedMessage._id,
        fullName: savedMessage.fullName,
        anonymousName: savedMessage.anonymousName,
        message: savedMessage.message,
        createdAt: savedMessage.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
