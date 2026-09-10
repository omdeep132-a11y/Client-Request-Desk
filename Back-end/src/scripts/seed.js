require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../DB/db");
const Workspace = require("../Models/Workspace");
const User = require("../Models/User");
const Request = require("../Models/Request");
const Activity = require("../Models/Activity");
const WorkItem = require("../Models/WorkItem");

const seed = async () => {
  try {
    await connectDB();

    // 1. Wipe existing data (dev only)
    await Promise.all([
      Workspace.deleteMany({}),
      User.deleteMany({}),
      Request.deleteMany({}),
      Activity.deleteMany({}),
      WorkItem.deleteMany({}),
    ]);
    console.log("Cleared existing data");

    // 2. Workspaces
    const workspaces = await Workspace.insertMany([
      { name: "Acme Plumbing" },
      { name: "Bright Electrical" },
      { name: "Coastal HVAC" },
      { name: "Summit Roofing" },
      { name: "Metro Cleaning" },
    ]);
    console.log(`Created ${workspaces.length} workspaces`);

    // 3. One user per workspace
    const users = await User.insertMany([
      { email: "alice@acme.test",    name: "Alice", workspaceId: workspaces[0]._id },
      { email: "bob@bright.test",    name: "Bob",   workspaceId: workspaces[1]._id },
      { email: "carol@coastal.test", name: "Carol", workspaceId: workspaces[2]._id },
      { email: "dave@summit.test",   name: "Dave",  workspaceId: workspaces[3]._id },
      { email: "erin@metro.test",    name: "Erin",  workspaceId: workspaces[4]._id },
    ]);
    console.log(`Created ${users.length} users`);

    // 4. Requests per workspace — mixed statuses
    const requestTemplates = [
      { customerName: "John Smith",   service: "Boiler repair",     status: "NEW" },
      { customerName: "Mary Johnson", service: "Leak inspection",   status: "NEW" },
      { customerName: "Peter Brown",  service: "Full rewire quote", status: "QUALIFIED" },
      { customerName: "Sara Davis",   service: "AC installation",   status: "QUALIFIED" },
      { customerName: "Tom Wilson",   service: "Drain unclogging",  status: "CLOSED" },
    ];

    const requestsToInsert = [];
    workspaces.forEach((ws, i) => {
      requestTemplates.forEach((t, j) => {
        requestsToInsert.push({
          workspaceId: ws._id,
          customerName: t.customerName,
          service: t.service,
          scheduledDate: new Date(Date.now() + (j + 1) * 24 * 60 * 60 * 1000),
          notes: `Sample request for ${ws.name}`,
          status: t.status,
          createdBy: users[i]._id,
        });
      });
    });

    const requests = await Request.insertMany(requestsToInsert);
    console.log(`Created ${requests.length} requests`);

    // 5. Activity entry for every request
    const activitiesToInsert = requests.map((r) => ({
      workspaceId: r.workspaceId,
      requestId: r._id,
      userId: r.createdBy,
      action: "REQUEST_CREATED",
      metadata: {},
    }));
    await Activity.insertMany(activitiesToInsert);
    console.log(`Created ${activitiesToInsert.length} activity entries`);

    console.log("\n=== SEED COMPLETE ===\n");
    console.log("Login with any of these emails:");
    users.forEach((u) => console.log(`  ${u.email}`));
    console.log("");

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
};

seed();