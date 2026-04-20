const express = require("express");

const Profile = require("../models/Profile");
const { validateProfilePayload } = require("../utils/validation");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { sanitized, errors, isValid } = validateProfilePayload(req.body);

    if (!isValid) {
      const error = new Error("Validation failed");
      error.statusCode = 400;
      error.details = errors;
      throw error;
    }

    const profile = await Profile.create(sanitized);

    return res.status(201).json({
      message: "Profile created successfully.",
      data: {
        id: profile._id,
        email: profile.email,
        fullName: profile.fullName,
        age: profile.age,
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
