const mongoose = require("mongoose");

const REQUEST_STATUSES = ["NEW", "QUALIFIED", "CLOSED"];

const requestSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    service: {
      type: String,
      required: [true, "Requested service is required"],
      trim: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, "Scheduled date is required"],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: {
        values: REQUEST_STATUSES,
        message: "Status must be one of: NEW, QUALIFIED, CLOSED",
      },
      default: "NEW",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Useful compound index: list requests for a workspace, filtered by status
requestSchema.index({ workspaceId: 1, status: 1 });
requestSchema.index({ workspaceId: 1, createdAt: -1 });

module.exports = mongoose.model("Request", requestSchema);
module.exports.REQUEST_STATUSES = REQUEST_STATUSES;