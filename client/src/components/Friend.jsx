import { useState } from "react";
import { PersonAddOutlined, PersonRemoveOutlined } from "@mui/icons-material";
import { Alert, Box, IconButton, Snackbar, Typography, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setFriends } from "../state";
import { request } from "../api";
import FlexBetween from "./FlexBetween";
import UserImage from "./UserImage";

const Friend = ({ friendId, name, subtitle, userPicturePath }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { _id } = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const friends = useSelector((state) => state.user.friends);
  const { palette } = useTheme();
  const primaryLight = palette.primary.light;
  const primaryDark = palette.primary.dark;
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;

  const [toast, setToast] = useState({ open: false, text: "", severity: "success" });
  const [busy, setBusy] = useState(false);

  const isSelf = friendId === _id;
  const isFriend = friends.some((f) => f._id === friendId);

  const patchFriend = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const data = await request(`/users/${_id}/${friendId}`, { method: "PATCH", token });
      dispatch(setFriends({ friends: data }));
      setToast({
        open: true,
        severity: "success",
        text: isFriend ? "Removed from Friend list" : "Added to Friend list",
      });
    } catch (e) {
      setToast({ open: true, severity: "error", text: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <FlexBetween>
      <FlexBetween gap="1rem">
        <UserImage image={userPicturePath} size="55px" />
        <Box onClick={() => navigate(`/profile/${friendId}`)}>
          <Typography
            color={main}
            variant="h5"
            fontWeight="500"
            sx={{ "&:hover": { color: palette.primary.main, cursor: "pointer" } }}
          >
            {name}
          </Typography>
          <Typography color={medium} fontSize="0.75rem">
            {subtitle}
          </Typography>
        </Box>
      </FlexBetween>
      {!isSelf && (
        <IconButton
          onClick={patchFriend}
          disabled={busy}
          aria-label={isFriend ? "Remove friend" : "Add friend"}
          sx={{ backgroundColor: primaryLight, p: "0.6rem" }}
        >
          {isFriend ? (
            <PersonRemoveOutlined sx={{ color: primaryDark }} />
          ) : (
            <PersonAddOutlined sx={{ color: primaryDark }} />
          )}
        </IconButton>
      )}
      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} variant="filled" sx={{ width: "100%" }}>
          {toast.text}
        </Alert>
      </Snackbar>
    </FlexBetween>
  );
};

export default Friend;
