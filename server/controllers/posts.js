import Post from "../models/Post.js";
import { HttpError } from "../utils/HttpError.js";
import { removeFile, saveFile } from "../utils/storage.js";
import { mediaTypeOf } from "../middleware/upload.js";
import { USER_PUBLIC_FIELDS } from "../utils/serialize.js";

const withAuthors = (query) =>
  query
    .populate("author", USER_PUBLIC_FIELDS)
    .populate("comments.author", "firstName lastName picturePath");

export const createPost = async (req, res) => {
  const file = req.file;
  const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
  if (description.length > 1000) throw new HttpError(400, "Caption is too long (max 1000 characters).");
  if (!description && !file) throw new HttpError(400, "Write something or attach a file to post.");

  const mediaPath = file ? await saveFile(file) : "";
  try {
    const post = await Post.create({
      author: req.user.id,
      description,
      mediaPath,
      mediaType: file ? mediaTypeOf(file.mimetype) : "",
      mediaName: file ? file.originalname.slice(0, 150) : "",
    });
    res.status(201).json(await withAuthors(Post.findById(post._id)));
  } catch (err) {
    await removeFile(mediaPath);
    throw err;
  }
};

export const getFeedPosts = async (req, res) => {
  const posts = await withAuthors(Post.find().sort({ createdAt: -1 }).limit(100));
  res.json(posts);
};

export const getUserPosts = async (req, res) => {
  const posts = await withAuthors(
    Post.find({ author: req.params.userId }).sort({ createdAt: -1 }).limit(100)
  );
  res.json(posts);
};

export const likePost = async (req, res) => {
  const post = await Post.findById(req.params.id).select("likes");
  if (!post) throw new HttpError(404, "Post not found.");
  const liked = post.likes.some((u) => String(u) === req.user.id);
  const update = liked ? { $pull: { likes: req.user.id } } : { $addToSet: { likes: req.user.id } };
  const updated = await withAuthors(Post.findByIdAndUpdate(req.params.id, update, { new: true }));
  res.json(updated);
};

export const createComment = async (req, res) => {
  const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
  if (!text) throw new HttpError(400, "Comment cannot be empty.");
  if (text.length > 500) throw new HttpError(400, "Comment is too long (max 500 characters).");
  const updated = await withAuthors(
    Post.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { author: req.user.id, text } } },
      { new: true }
    )
  );
  if (!updated) throw new HttpError(404, "Post not found.");
  res.status(201).json(updated);
};

export const deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new HttpError(404, "Post not found.");
  if (String(post.author) !== req.user.id) throw new HttpError(403, "You can only delete your own posts.");
  await post.deleteOne();
  await removeFile(post.mediaPath);
  res.json({ _id: post._id });
};

/** Recent likes and comments other people left on the current user's posts. */
export const getNotifications = async (req, res) => {
  const posts = await Post.find({ author: req.user.id })
    .sort({ updatedAt: -1 })
    .limit(20)
    .populate("likes", "firstName lastName")
    .populate("comments.author", "firstName lastName")
    .lean();

  const items = [];
  for (const p of posts) {
    const label = (p.description || p.mediaName || "your post").slice(0, 40);
    const likers = p.likes.filter((u) => String(u._id) !== req.user.id);
    if (likers.length) {
      const names = likers.slice(0, 2).map((u) => `${u.firstName} ${u.lastName}`).join(", ");
      const more = likers.length > 2 ? ` and ${likers.length - 2} more` : "";
      items.push({
        id: `like-${p._id}`,
        text: `${names}${more} liked "${label}"`,
        createdAt: p.updatedAt,
      });
    }
    for (const c of p.comments) {
      if (String(c.author._id) === req.user.id) continue;
      items.push({
        id: `comment-${c._id}`,
        text: `${c.author.firstName} ${c.author.lastName} commented on "${label}"`,
        createdAt: c.createdAt,
      });
    }
  }
  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(items.slice(0, 15));
};
