import mongoose from "mongoose";
import User from "../models/User.js";
import Post from "../models/Post.js";

export const USER_PUBLIC_FIELDS = "firstName lastName location occupation picturePath";

export const toFriend = (u) => ({
  _id: u._id,
  firstName: u.firstName,
  lastName: u.lastName,
  occupation: u.occupation,
  location: u.location,
  picturePath: u.picturePath,
});

/** Impressions = total likes + comments received on the user's posts. */
const countImpressions = async (userId) => {
  const rows = await Post.aggregate([
    { $match: { author: new mongoose.Types.ObjectId(String(userId)) } },
    {
      $group: {
        _id: null,
        total: { $sum: { $add: [{ $size: "$likes" }, { $size: "$comments" }] } },
      },
    },
  ]);
  return rows[0]?.total || 0;
};

export const buildUser = async (userId, { self = false } = {}) => {
  const user = await User.findById(userId).populate("friends", USER_PUBLIC_FIELDS);
  if (!user) return null;
  const out = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    location: user.location,
    occupation: user.occupation,
    picturePath: user.picturePath,
    socials: { twitter: user.socials?.twitter || "", linkedin: user.socials?.linkedin || "" },
    friends: user.friends.map(toFriend),
    viewedProfile: user.viewedProfile,
    impressions: await countImpressions(user._id),
    createdAt: user.createdAt,
  };
  if (self) out.email = user.email;
  return out;
};
