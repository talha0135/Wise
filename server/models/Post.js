import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    mediaPath: { type: String, default: "" },
    mediaType: { type: String, enum: ["", "image", "video", "audio", "file"], default: "" },
    mediaName: { type: String, default: "" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

export default mongoose.model("Post", postSchema);
