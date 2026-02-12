import bcrypt from "bcryptjs";
import User from "../models/User.js";

const adminEmail = process.env.ADMIN_EMAIL || "admin@cryptoinvest.com";
const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";

const demoEmail = process.env.DEMO_USER_EMAIL || "user@cryptoinvest.com";
const demoPassword = process.env.DEMO_USER_PASSWORD || "User@123456";

export const seedDefaultUsers = async () => {
  const adminExists = await User.findOne({ email: adminEmail });
  const userExists = await User.findOne({ email: demoEmail });

  if (!adminExists) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await User.create({
      name: "System Admin",
      firstName: "System",
      lastName: "Admin",
      email: adminEmail,
      password: hashed,
      role: "admin",
      balance: 0,
      country: "United States",
      currency: "USD",
    });
    console.log("Seeded admin account:");
    console.log(`  email: ${adminEmail}`);
    console.log(`  password: ${adminPassword}`);
  }

  if (!userExists) {
    const hashed = await bcrypt.hash(demoPassword, 10);
    await User.create({
      name: "Demo User",
      firstName: "Demo",
      lastName: "User",
      email: demoEmail,
      password: hashed,
      role: "user",
      balance: 0,
      country: "United States",
      currency: "USD",
    });
    console.log("Seeded user account:");
    console.log(`  email: ${demoEmail}`);
    console.log(`  password: ${demoPassword}`);
  }
};
