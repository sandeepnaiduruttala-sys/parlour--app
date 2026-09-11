import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerPhone: { type: String, required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    serviceName: { type: String, required: true },
    preferredDate: { type: String, required: true },
    preferredTime: { type: String, required: true },
    note: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    confirmedDate: { type: String, default: "" },
    confirmedTime: { type: String, default: "" },
    adminMessage: { type: String, trim: true, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
