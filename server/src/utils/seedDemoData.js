const User = require("../models/User");
const FinancialRecord = require("../models/FinancialRecord");

const demoUsers = [
  {
    name: "Admin User",
    email: "admin@finance.local",
    role: "admin",
    status: "active",
  },
  {
    name: "Ava Analyst",
    email: "analyst@finance.local",
    role: "analyst",
    status: "active",
  },
  {
    name: "Victor Viewer",
    email: "viewer@finance.local",
    role: "viewer",
    status: "active",
  },
];

const demoRecords = (adminUserId) => [
  {
    amount: 5500,
    type: "income",
    category: "Salary",
    date: new Date("2026-03-01T09:00:00.000Z"),
    notes: "Monthly salary credited",
    createdBy: adminUserId,
  },
  {
    amount: 1300,
    type: "expense",
    category: "Rent",
    date: new Date("2026-03-03T09:00:00.000Z"),
    notes: "Apartment rent",
    createdBy: adminUserId,
  },
  {
    amount: 220,
    type: "expense",
    category: "Groceries",
    date: new Date("2026-03-05T09:00:00.000Z"),
    notes: "Weekly grocery shopping",
    createdBy: adminUserId,
  },
  {
    amount: 600,
    type: "income",
    category: "Freelance",
    date: new Date("2026-03-11T09:00:00.000Z"),
    notes: "Consulting work",
    createdBy: adminUserId,
  },
  {
    amount: 180,
    type: "expense",
    category: "Transport",
    date: new Date("2026-03-14T09:00:00.000Z"),
    notes: "Fuel and travel",
    createdBy: adminUserId,
  },
  {
    amount: 90,
    type: "expense",
    category: "Utilities",
    date: new Date("2026-03-18T09:00:00.000Z"),
    notes: "Electricity bill",
    createdBy: adminUserId,
  },
];

const seedDemoData = async () => {
  const userCount = await User.countDocuments();

  if (userCount === 0) {
    const users = await User.insertMany(demoUsers);
    const adminUser = users.find((user) => user.role === "admin");

    if (adminUser) {
      await FinancialRecord.insertMany(demoRecords(adminUser._id));
    }

    console.log("Demo users and records seeded");
  }
};

module.exports = seedDemoData;
