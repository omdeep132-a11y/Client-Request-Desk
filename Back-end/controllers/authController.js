
   // ← add this line
const jwt = require("jsonwebtoken");
const User = require("../src/Models/User");
const Workspace = require("../src/Models/Workspace");

exports.login = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).populate(
      "workspaceId"
    );

    if (!user) {
      return res.status(401).json({ error: "Unknown user" });
    }

    const token = jwt.sign(
      { userId: user._id, workspaceId: user.workspaceId._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        workspace: {
          id: user.workspaceId._id,
          name: user.workspaceId.name,
        },
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate("workspaceId");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      workspace: {
        id: user.workspaceId._id,
        name: user.workspaceId.name,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};