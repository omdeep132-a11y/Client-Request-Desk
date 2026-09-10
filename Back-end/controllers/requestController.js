const Request = require("../src/Models/Request");
const WorkItem = require("../src/Models/WorkItem");
const Activity = require("../src/Models/Activity");

const VALID_STATUSES = ["NEW", "QUALIFIED", "CLOSED"];

// GET /api/requests?status=...
exports.list = async (req, res) => {
  try {
    const filter = { workspaceId: req.user.workspaceId };

    if (req.query.status) {
      if (!VALID_STATUSES.includes(req.query.status)) {
        return res.status(400).json({ error: "Invalid status filter" });
      }
      filter.status = req.query.status;
    }

    const requests = await Request.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to list requests" });
  }
};

// POST /api/requests
exports.create = async (req, res) => {
  try {
    const { customerName, service, scheduledDate, notes } = req.body;

    if (!customerName || !service || !scheduledDate) {
      return res.status(400).json({
        error: "customerName, service and scheduledDate are required",
      });
    }

    const request = await Request.create({
      workspaceId: req.user.workspaceId,   // ← from JWT, never from body
      customerName,
      service,
      scheduledDate,
      notes: notes || "",
      status: "NEW",
      createdBy: req.user.userId,
    });

    await Activity.create({
      workspaceId: req.user.workspaceId,
      requestId: request._id,
      userId: req.user.userId,
      action: "REQUEST_CREATED",
    });

    res.status(201).json(request);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to create request" });
  }
};

// GET /api/requests/:id
exports.getOne = async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      workspaceId: req.user.workspaceId,   // ← isolation
    });

    if (!request) return res.status(404).json({ error: "Not found" });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch request" });
  }
};

// PATCH /api/requests/:id
exports.update = async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      workspaceId: req.user.workspaceId,
    });

    if (!request) return res.status(404).json({ error: "Not found" });

    if (req.body.status && !VALID_STATUSES.includes(req.body.status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const previousStatus = request.status;

    const allowed = ["customerName", "service", "scheduledDate", "notes", "status"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) request[key] = req.body[key];
    }

    await request.save();

    if (req.body.status && req.body.status !== previousStatus) {
      await Activity.create({
        workspaceId: req.user.workspaceId,
        requestId: request._id,
        userId: req.user.userId,
        action: "STATUS_CHANGED",
        metadata: { from: previousStatus, to: req.body.status },
      });
    } else {
      await Activity.create({
        workspaceId: req.user.workspaceId,
        requestId: request._id,
        userId: req.user.userId,
        action: "REQUEST_UPDATED",
      });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: "Failed to update request" });
  }
};

// POST /api/requests/:id/convert  ⭐ THE IMPORTANT ONE
exports.convert = async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      workspaceId: req.user.workspaceId,
    });

    if (!request) return res.status(404).json({ error: "Not found" });

    if (request.status !== "QUALIFIED") {
      return res
        .status(400)
        .json({ error: "Only QUALIFIED requests can be converted" });
    }

    try {
      const workItem = await WorkItem.create({
        workspaceId: req.user.workspaceId,
        requestId: request._id,      // ← unique index prevents duplicates
        customerName: request.customerName,
        service: request.service,
        scheduledDate: request.scheduledDate,
        createdBy: req.user.userId,
      });

      await Activity.create({
        workspaceId: req.user.workspaceId,
        requestId: request._id,
        userId: req.user.userId,
        action: "WORK_ITEM_CREATED",
        metadata: { workItemId: workItem._id },
      });

      res.status(201).json(workItem);
    } catch (err) {
      if (err.code === 11000) {
        return res
          .status(409)
          .json({ error: "This request has already been converted" });
      }
      throw err;
    }
  } catch (err) {
    console.error("Convert error:", err);
    res.status(500).json({ error: "Failed to convert request" });
  }
};

// GET /api/requests/:id/activity
exports.activity = async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      workspaceId: req.user.workspaceId,
    });

    if (!request) return res.status(404).json({ error: "Not found" });

    const activities = await Activity.find({ requestId: request._id })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch activity" });
  }
};