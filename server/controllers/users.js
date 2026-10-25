import User from "../models/User.js";
import { HttpError } from "../utils/HttpError.js";
import { buildUser, toFriend, USER_PUBLIC_FIELDS } from "../utils/serialize.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const searchUsers = async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 50) : "";
  if (!q) return res.json([]);
  const tokens = q.split(/\s+/).map(escapeRegex);
  const users = await User.find({
    $and: tokens.map((t) => ({
      $or: [{ firstName: new RegExp(t, "i") }, { lastName: new RegExp(t, "i") }],
    })),
  })
    .select(USER_PUBLIC_FIELDS)
    .limit(8);
  res.json(users.map(toFriend));
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  const isSelf = id === req.user.id;
  if (!isSelf && req.query.view === "1") {
    await User.updateOne({ _id: id }, { $inc: { viewedProfile: 1 } });
  }
  const user = await buildUser(id, { self: isSelf });
  if (!user) throw new HttpError(404, "User not found.");
  res.json(user);
};

export const getUserFriends = async (req, res) => {
  const user = await User.findById(req.params.id).populate("friends", USER_PUBLIC_FIELDS);
  if (!user) throw new HttpError(404, "User not found.");
  res.json(user.friends.map(toFriend));
};

export const addRemoveFriend = async (req, res) => {
  const { id, friendId } = req.params;
  if (id !== req.user.id) throw new HttpError(403, "You can only change your own friend list.");
  if (id === friendId) throw new HttpError(400, "You cannot friend yourself.");

  const [user, friend] = await Promise.all([User.findById(id), User.findById(friendId)]);
  if (!user || !friend) throw new HttpError(404, "User not found.");

  const already = user.friends.some((f) => String(f) === friendId);
  if (already) {
    await Promise.all([
      User.updateOne({ _id: id }, { $pull: { friends: friend._id } }),
      User.updateOne({ _id: friendId }, { $pull: { friends: user._id } }),
    ]);
  } else {
    await Promise.all([
      User.updateOne({ _id: id }, { $addToSet: { friends: friend._id } }),
      User.updateOne({ _id: friendId }, { $addToSet: { friends: user._id } }),
    ]);
  }
  const updated = await User.findById(id).populate("friends", USER_PUBLIC_FIELDS);
  res.json(updated.friends.map(toFriend));
};

export const updateProfile = async (req, res) => {
  if (req.params.id !== req.user.id) throw new HttpError(403, "You can only edit your own profile.");
  const clean = (v) => (typeof v === "string" ? v.trim() : undefined);
  const location = clean(req.body.location);
  const occupation = clean(req.body.occupation);
  const twitter = clean(req.body.twitter);
  const linkedin = clean(req.body.linkedin);

  const set = {};
  if (location !== undefined) {
    if (!location || location.length > 100) throw new HttpError(400, "Location is required (max 100 characters).");
    set.location = location;
  }
  if (occupation !== undefined) {
    if (!occupation || occupation.length > 100) throw new HttpError(400, "Occupation is required (max 100 characters).");
    set.occupation = occupation;
  }
  if (twitter !== undefined) {
    if (twitter.length > 100) throw new HttpError(400, "Twitter value is too long (max 100).");
    set["socials.twitter"] = twitter;
  }
  if (linkedin !== undefined) {
    if (linkedin.length > 100) throw new HttpError(400, "LinkedIn value is too long (max 100).");
    set["socials.linkedin"] = linkedin;
  }
  if (!Object.keys(set).length) throw new HttpError(400, "Nothing to update.");

  await User.updateOne({ _id: req.user.id }, { $set: set });
  res.json(await buildUser(req.user.id, { self: true }));
};
