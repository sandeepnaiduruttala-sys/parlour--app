import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "./models/User.js";
import Service from "./models/Service.js";
import Booking from "./models/Booking.js";
import Otp from "./models/Otp.js";
import Photo from "./models/Photo.js";
import { sendOtp } from "./services/mailer.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "8mb" }));

const port = process.env.PORT || 5000;
const adminPhone = process.env.ADMIN_PHONE || "7799553251";
const adminPassword = process.env.ADMIN_PASSWORD || "satyakala12345";

function normalizePhone(phone = "") {
  return phone.replace(/\D/g, "").slice(-10);
}

function signUser(user) {
  return jwt.sign(
    { id: user._id?.toString() || "admin", phone: user.phone, role: user.role },
    process.env.JWT_SECRET || "development-secret"
  );
}

function auth(requiredRole) {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      const payload = jwt.verify(token, process.env.JWT_SECRET || "development-secret");
      if (requiredRole && payload.role !== requiredRole) return res.status(403).json({ message: "Admin access required" });
      req.user = payload;
      next();
    } catch {
      res.status(401).json({ message: "Please sign in again" });
    }
  };
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/auth/request-otp", async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  if (phone.length !== 10) return res.status(400).json({ message: "Enter a valid 10-digit phone number" });
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  await Otp.findOneAndUpdate(
    { phone },
    { phone, code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    { upsert: true, new: true }
  );
  let delivery;
  try {
    delivery = await sendOtp(phone, otp);
  } catch (error) {
    console.error("OTP delivery failed", error);
    return res.status(502).json({ message: "The OTP could not be delivered. Check the SMS provider configuration." });
  }
  if (!delivery.delivered) {
    return res.status(503).json({ message: "OTP delivery is not configured. Add an SMS provider before requesting verification." });
  }
  res.json({ message: "Your verification code has been sent to your phone" });
});

app.post("/api/auth/register", async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const { password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
  if (phone === adminPhone) return res.status(409).json({ message: "This phone is reserved for the parlour admin" });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.findOneAndUpdate(
    { phone },
    { phone, passwordHash, role: "customer", isVerified: true },
    { upsert: true, new: true }
  );
  res.status(201).json({ token: signUser(user), user: { phone, role: user.role } });
});

app.post("/api/auth/login", async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const { password } = req.body;
  if (phone === adminPhone && password === adminPassword) {
    return res.json({ token: signUser({ phone, role: "admin" }), user: { phone, role: "admin" } });
  }
  const user = await User.findOne({ phone });
  if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) return res.status(401).json({ message: "Phone number or password is incorrect" });
  if (!user.isVerified) return res.status(403).json({ message: "Please verify your phone number first" });
  res.json({ token: signUser(user), user: { phone, role: user.role } });
});

app.post("/api/auth/reset-password", async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const { otp, password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
  if (phone === adminPhone) return res.status(400).json({ message: "Use the admin password configured for this account" });
  const savedOtp = await Otp.findOne({ phone });
  if (!savedOtp || savedOtp.expiresAt < new Date() || savedOtp.code !== otp) return res.status(400).json({ message: "Invalid or expired OTP" });
  const user = await User.findOne({ phone });
  if (!user) return res.status(404).json({ message: "No account found for this phone number" });
  user.passwordHash = await bcrypt.hash(password, 10);
  user.isVerified = true;
  await user.save();
  await Otp.deleteOne({ phone });
  res.json({ message: "Password updated. You can now sign in." });
});

app.get("/api/services", async (_req, res) => {
  const services = await Service.find().sort({ createdAt: -1 });
  res.json(services);
});

app.post("/api/services", auth("admin"), async (req, res) => {
  const { name, description, price, category } = req.body;
  if (!name || !description || !category || Number.isNaN(Number(price))) return res.status(400).json({ message: "Complete all service fields" });
  const service = await Service.create({ name, description, price: Number(price), category });
  res.status(201).json(service);
});

app.delete("/api/services/:id", auth("admin"), async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

app.get("/api/photos", async (_req, res) => {
  const photos = await Photo.find().select("slot image mimeType updatedAt").sort({ slot: 1 });
  res.json(photos);
});

app.put("/api/photos/:slot", auth("admin"), async (req, res) => {
  const { image, mimeType } = req.body;
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!image || !mimeType || !allowedTypes.includes(mimeType) || !image.startsWith(`data:${mimeType};base64,`)) {
    return res.status(400).json({ message: "Upload a JPG, PNG, WEBP, or GIF image" });
  }
  if (Buffer.byteLength(image, "utf8") > 7 * 1024 * 1024) {
    return res.status(413).json({ message: "Image must be smaller than 5 MB" });
  }
  const photo = await Photo.findOneAndUpdate(
    { slot: req.params.slot },
    { slot: req.params.slot, image, mimeType, updatedBy: req.user.phone },
    { upsert: true, new: true, runValidators: true }
  ).select("slot image mimeType updatedAt");
  res.json(photo);
});

app.post("/api/bookings", auth(), async (req, res) => {
  const { serviceId, preferredDate, preferredTime, note = "" } = req.body;
  if (req.user.role !== "customer") return res.status(403).json({ message: "Customer access required" });
  if (!serviceId || !preferredDate || !preferredTime) return res.status(400).json({ message: "Choose a service, date, and time" });
  const service = await Service.findById(serviceId);
  if (!service) return res.status(404).json({ message: "That service is no longer available" });
  const booking = await Booking.create({
    customer: req.user.id,
    customerPhone: req.user.phone,
    service: service._id,
    serviceName: service.name,
    preferredDate,
    preferredTime,
    note: String(note).trim()
  });
  res.status(201).json(booking);
});

app.get("/api/bookings", auth(), async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { customer: req.user.id };
  const bookings = await Booking.find(filter).sort({ createdAt: -1 });
  res.json(bookings);
});

app.delete("/api/bookings", auth("admin"), async (_req, res) => {
  await Booking.deleteMany({});
  res.status(204).end();
});

app.patch("/api/bookings/:id", auth("admin"), async (req, res) => {
  const { status, confirmedDate = "", confirmedTime = "", adminMessage = "" } = req.body;
  if (!["accepted", "rejected"].includes(status)) return res.status(400).json({ message: "Choose accepted or rejected" });
  if (status === "accepted" && (!confirmedDate || !confirmedTime)) {
    return res.status(400).json({ message: "Add the confirmed date and time before accepting" });
  }
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status, confirmedDate, confirmedTime, adminMessage: String(adminMessage).trim() },
    { new: true, runValidators: true }
  );
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  res.json(booking);
});

async function start() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected to MongoDB");
  app.listen(port, () => console.log(`API listening on ${port}`));
}

start().catch((error) => {
  console.error("Unable to start API", error);
  process.exit(1);
});
