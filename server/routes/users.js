import express from "express";
import {
  getUser,
  getUserFriends,
  addRemoveFriend,
  searchUsers,
  updateProfile,
} from "../controllers/users.js";
import { verifyToken, validateObjectIdParam } from "../middleware/auth.js";
import { asyncHandler } from "../utils/HttpError.js";

const router = express.Router();
router.use(verifyToken);
router.param("id", validateObjectIdParam);
router.param("friendId", validateObjectIdParam);

router.get("/search", asyncHandler(searchUsers));
router.get("/:id", asyncHandler(getUser));
router.get("/:id/friends", asyncHandler(getUserFriends));
router.patch("/:id", asyncHandler(updateProfile));
router.patch("/:id/:friendId", asyncHandler(addRemoveFriend));

export default router;
