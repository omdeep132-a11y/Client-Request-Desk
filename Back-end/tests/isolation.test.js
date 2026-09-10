const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const Workspace = require("../src/Models/Workspace");
const User = require("../src/Models/User");
const Request = require("../src/Models/Request");

describe("Workspace isolation", () => {
  let wsA, wsB, userA, userB, reqA, tokenB;

  beforeEach(async () => {
    wsA = await Workspace.create({ name: "Acme" });
    wsB = await Workspace.create({ name: "Bright" });

    userA = await User.create({
      email: "alice@acme.test",
      name: "Alice",
      workspaceId: wsA._id,
    });
    userB = await User.create({
      email: "bob@bright.test",
      name: "Bob",
      workspaceId: wsB._id,
    });

    reqA = await Request.create({
      workspaceId: wsA._id,
      customerName: "John Smith",
      service: "Boiler repair",
      scheduledDate: new Date(),
      createdBy: userA._id,
    });

    tokenB = jwt.sign(
      { userId: userB._id, workspaceId: userB.workspaceId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  it("returns 404 when Bob reads Alice's request", async () => {
    const res = await request(app)
      .get(`/api/requests/${reqA._id}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(404);
  });

  it("returns 404 when Bob updates Alice's request", async () => {
    const res = await request(app)
      .patch(`/api/requests/${reqA._id}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ status: "QUALIFIED" });

    expect(res.status).toBe(404);
  });

  it("returns 404 when Bob converts Alice's request", async () => {
    const res = await request(app)
      .post(`/api/requests/${reqA._id}/convert`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(404);
  });

  it("returns 404 when Bob reads Alice's activity", async () => {
    const res = await request(app)
      .get(`/api/requests/${reqA._id}/activity`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(404);
  });

  it("Bob's own list doesn't include Alice's requests", async () => {
    const res = await request(app)
      .get("/api/requests")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0); // Bob has no requests
  });
});