import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, enum: ["Makeup", "Facial"], required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
