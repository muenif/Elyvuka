require("dotenv").config();
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

const run = async () => {
  await connectDB();

  const email = process.env.SEED_ADMIN_EMAIL;
  const existing = await Admin.findOne({ email });

  if (existing) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  const admin = await Admin.create({
    name: process.env.SEED_ADMIN_NAME || "Admin",
    email,
    password: process.env.SEED_ADMIN_PASSWORD,
  });

  console.log(`Admin created: ${admin.email}`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
