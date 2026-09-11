import mongoose from "mongoose";

const photoSchema = new mongoose.Schema(
  {
    slot: { type: String, required: true, unique: true, trim: true },
    image: { type: String, required: true },
    mimeType: { type: String, required: true },
    updatedBy: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Photo", photoSchema);
