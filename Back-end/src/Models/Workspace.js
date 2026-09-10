const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Workspace name is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workspace", workspaceSchema);