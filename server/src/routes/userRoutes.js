const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const User = require("../models/User");
const { createUserSchema, updateUserSchema } = require("../validators/userValidators");

const router = express.Router();

router.get(
  "/me",
  asyncHandler(async (req, res) => {
    res.json(req.user);
  })
);

router.get(
  "/",
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  })
);

router.post(
  "/",
  authorize("admin"),
  validate(createUserSchema),
  asyncHandler(async (req, res) => {
    const user = await User.create(req.body);
    res.status(201).json(user);
  })
);

router.patch(
  "/:id",
  authorize("admin"),
  validate(updateUserSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.json(user);
  })
);

module.exports = router;
