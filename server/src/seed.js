import "dotenv/config";
import mongoose from "mongoose";
import Service from "./models/Service.js";

const services = [];

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  await Service.deleteMany({});
  if (services.length) await Service.insertMany(services);

  console.log(`Seeded ${services.length} services; service catalogue cleared first`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error("Unable to seed database", error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
