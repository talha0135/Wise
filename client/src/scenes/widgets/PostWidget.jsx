import { useState } from "react";
import {
  ChatBubbleOutlineOutlined,
  DeleteOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  InsertDriveFileOutlined,
  ShareOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputBase,
  Snackbar,
  Typography,
  useTheme,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { removePost, setPost } from "../../state";
import { assetUrl, request, timeAgo } from "../../api";
import FlexBetween from "../../components/FlexBetween";
import Friend from "../../components/Friend";
import UserImage from "../../components/UserImage";
import WidgetWrapper from "../../components/WidgetWrapper";

const PostWidget = ({ post }) => {
  const [isComments, setIsComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  const { _id, author, description, mediaPath, mediaType, mediaName, likes, comments, createdAt } = post;
  const isLiked = likes.includes(loggedInUserId);
  const isMine = author._id === loggedInUserId;
  const src = assetUrl(mediaPath);

  const fail = (e) => setToast({ text: e.message, severity: "error" });

  const patchLike = async () => {
    try {
      const updated = await request(`/posts/${_id}/like`, { method: "PATCH", token });
      dispatch(setPost({ post: updated }));
    } catch (e) {
      fail(e);
    }
  };

  const addComment = async () => {
    const text = newComment.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      const updated = await request(`/posts/${_id}/comments`, { method: "POST", token, body: { text } });
      dispatch(setPost({ post: updated }));
      setNewComment("");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const deletePost = async () => {
    if (!window.confirm("Delete this post permanently?")) return;
    try {
      await request(`/posts/${_id}`, { method: "DELETE", token });
      dispatch(removePost({ postId: _id }));
    } catch (e) {
      fail(e);
    }
  };

  const share = async () => {
    const link = `${window.location.origin}/profile/${author._id}`;
    try {
      await navigator.clipboard.writeText(link);
      setToast({ text: "Profile link copied to clipboard", severity: "success" });
    } catch {
      setToast({ text: link, severity: "info" });
    }
  };

  return (
    <WidgetWrapper mb="2rem">
      <Friend
        friendId={author._id}
        name={`${author.firstName} ${author.lastName}`}
        subtitle={`${author.location} · ${timeAgo(createdAt)}`}
        userPicturePath={author.picturePath}
      />

      {description && (
        <Typography color={main} sx={{ mt: "1rem", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {description}
        </Typography>
      )}

      {mediaType === "image" && (
        <img
          width="100%"
          height="auto"
          alt={mediaName || "post"}
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={src}
        />
      )}
      {mediaType === "video" && (
        <video
          controls
          preload="metadata"
          style={{ width: "100%", borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={src}
        />
      )}
      {mediaType === "audio" && (
        <audio controls preload="metadata" style={{ width: "100%", marginTop: "0.75rem" }} src={src} />
      )}
      {mediaType === "file" && (
        <Box
          component="a"
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            mt: "0.75rem",
            p: "1rem",
            borderRadius: "0.75rem",
            textDecoration: "none",
            color: main,
            backgroundColor: palette.neutral.light,
            "&:hover": { color: primary },
          }}
        >
          <InsertDriveFileOutlined />
          <Typography sx={{ wordBreak: "break-all" }}>{mediaName || "Attachment"} (open / download)</Typography>
        </Box>
      )}

      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike} aria-label={isLiked ? "Unlike" : "Like"}>
              {isLiked ? <FavoriteOutlined sx={{ color: primary }} /> : <FavoriteBorderOutlined />}
            </IconButton>
            <Typography>{likes.length}</Typography>
          </FlexBetween>
          <FlexBetween gap="0.3rem">
            <IconButton onClick={() => setIsComments(!isComments)} aria-label="Comments">
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{comments.length}</Typography>
          </FlexBetween>
        </FlexBetween>
        <Box>
          {isMine && (
            <IconButton onClick={deletePost} aria-label="Delete post">
              <DeleteOutlined />
            </IconButton>
          )}
          <IconButton onClick={share} aria-label="Share">
            <ShareOutlined />
          </IconButton>
        </Box>
      </FlexBetween>

      {isComments && (
        <Box mt="0.5rem">
          {comments.map((c) => (
            <Box key={c._id}>
              <Divider />
              <Box display="flex" gap="0.75rem" alignItems="flex-start" m="0.5rem 0">
                <UserImage image={c.author?.picturePath} size="32px" />
                <Box>
                  <Typography color={palette.neutral.dark} fontWeight="500" fontSize="0.8rem">
                    {c.author ? `${c.author.firstName} ${c.author.lastName}` : "Deleted user"}{" "}
                    <Typography component="span" color={palette.neutral.medium} fontSize="0.7rem">
                      {timeAgo(c.createdAt)}
                    </Typography>
                  </Typography>
                  <Typography color={main} sx={{ wordBreak: "break-word" }}>
                    {c.text}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
          <Divider />
          <FlexBetween gap="0.75rem" mt="0.75rem" mb="0.5rem">
            <InputBase
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addComment()}
              inputProps={{ maxLength: 500 }}
              sx={{
                width: "100%",
                backgroundColor: palette.neutral.light,
                borderRadius: "2rem",
                padding: "0.5rem 1.25rem",
              }}
            />
            <Button
              disabled={!newComment.trim() || busy}
              onClick={addComment}
              sx={{
                color: palette.background.alt,
                backgroundColor: primary,
                borderRadius: "3rem",
                "&:hover": { backgroundColor: palette.primary.dark },
                "&.Mui-disabled": { backgroundColor: palette.neutral.light, color: palette.neutral.medium },
              }}
            >
              POST
            </Button>
          </FlexBetween>
        </Box>
      )}

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast?.severity || "info"} variant="filled" sx={{ width: "100%" }}>
          {toast?.text}
        </Alert>
      </Snackbar>
    </WidgetWrapper>
  );
};

export default PostWidget;
