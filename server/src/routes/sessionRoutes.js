const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");

const router = express.Router();

router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const users = await User.find({ status: "active" })
      .select("name email role status")
      .sort({ role: 1, name: 1 });

    res.json(users);
  })
);

module.exports = router;
