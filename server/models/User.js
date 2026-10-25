import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 100 },
    password: { type: String, required: true, select: false },
    picturePath: { type: String, required: true },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    location: { type: String, required: true, trim: true, maxlength: 100 },
    occupation: { type: String, required: true, trim: true, maxlength: 100 },
    socials: {
      twitter: { type: String, trim: true, maxlength: 100, default: "" },
      linkedin: { type: String, trim: true, maxlength: 100, default: "" },
    },
    viewedProfile: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
