const User = require("../models/User");

const auth = async (req, res, next) => {
  const userId = req.header("x-user-id");

  if (!userId) {
    return res.status(401).json({
      message: "Missing x-user-id header.",
    });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(401).json({
      message: "User session is invalid.",
    });
  }

  if (user.status !== "active") {
    return res.status(403).json({
      message: "This user is inactive.",
    });
  }

  req.user = user;
  next();
};

module.exports = auth;
