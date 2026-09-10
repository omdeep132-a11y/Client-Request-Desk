const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const Workspace = require("../src/Models/Workspace");
const User = require("../src/Models/User");
const Request = require("../src/Models/Request");
const WorkItem = require("../src/Models/WorkItem");

describe("Duplicate conversion prevention", () => {
  let workspace, user, req, token;

  beforeEach(async () => {
    workspace = await Workspace.create({ name: "Acme" });
    user = await User.create({
      email: "alice@acme.test",
      name: "Alice",
      workspaceId: workspace._id,
    });
    req = await Request.create({
      workspaceId: workspace._id,
      customerName: "John Smith",
      service: "Boiler repair",
      scheduledDate: new Date(),
      status: "QUALIFIED",
      createdBy: user._id,
    });
    token = jwt.sign(
      { userId: user._id, workspaceId: user.workspaceId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  it("first conversion returns 201", async () => {
    const res = await request(app)
      .post(`/api/requests/${req._id}/convert`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body.requestId.toString()).toBe(req._id.toString());
  });

  it("second conversion on the same request returns 409", async () => {
    await request(app)
      .post(`/api/requests/${req._id}/convert`)
      .set("Authorization", `Bearer ${token}`);

    const second = await request(app)
      .post(`/api/requests/${req._id}/convert`)
      .set("Authorization", `Bearer ${token}`);

    expect(second.status).toBe(409);
    expect(second.body.error).toMatch(/already been converted/i);
  });

  it("only one work item exists after two conversion attempts", async () => {
    await request(app)
      .post(`/api/requests/${req._id}/convert`)
      .set("Authorization", `Bearer ${token}`);

    await request(app)
      .post(`/api/requests/${req._id}/convert`)
      .set("Authorization", `Bearer ${token}`);

    const count = await WorkItem.countDocuments({ requestId: req._id });
    expect(count).toBe(1);
  });

  it("converting a NEW request returns 400", async () => {
    req.status = "NEW";
    await req.save();

    const res = await request(app)
      .post(`/api/requests/${req._id}/convert`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/qualified/i);
  });
});