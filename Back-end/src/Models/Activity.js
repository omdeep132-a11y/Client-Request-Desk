const mongoose = require("mongoose");

const ACTIVITY_ACTIONS = [
  "REQUEST_CREATED",
  "REQUEST_UPDATED",
  "STATUS_CHANGED",
  "WORK_ITEM_CREATED",
];

const activitySchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: {
        values: ACTIVITY_ACTIONS,
        message: "Unknown activity action",
      },
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true } // createdAt = when the action happened
);

// Fast lookup for a request's timeline, newest first
activitySchema.index({ requestId: 1, createdAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);
module.exports.ACTIVITY_ACTIONS = ACTIVITY_ACTIONS;