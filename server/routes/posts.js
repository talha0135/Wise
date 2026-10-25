import express from "express";
import {
  createPost,
  getFeedPosts,
  getUserPosts,
  likePost,
  createComment,
  deletePost,
  getNotifications,
} from "../controllers/posts.js";
import { verifyToken, validateObjectIdParam } from "../middleware/auth.js";
import { uploadMedia } from "../middleware/upload.js";
import { asyncHandler } from "../utils/HttpError.js";

const router = express.Router();
router.use(verifyToken);
router.param("id", validateObjectIdParam);
router.param("userId", validateObjectIdParam);

router.get("/", asyncHandler(getFeedPosts));
router.get("/notifications", asyncHandler(getNotifications));
router.get("/user/:userId", asyncHandler(getUserPosts));
router.post("/", uploadMedia, asyncHandler(createPost));
router.patch("/:id/like", asyncHandler(likePost));
router.post("/:id/comments", asyncHandler(createComment));
router.delete("/:id", asyncHandler(deletePost));

export default router;
