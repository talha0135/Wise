import { useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { useSelector } from "react-redux";
import Friend from "../../components/Friend";
import WidgetWrapper from "../../components/WidgetWrapper";
import { request } from "../../api";

const FriendListWidget = ({ userId }) => {
  const { palette } = useTheme();
  const token = useSelector((state) => state.token);
  const me = useSelector((state) => state.user);
  const isOwn = userId === me._id;
  const [others, setOthers] = useState([]);

  // For someone else's profile, load their list (and reload when my friends change).
  useEffect(() => {
    if (isOwn) return undefined;
    let cancelled = false;
    request(`/users/${userId}/friends`, { token })
      .then((data) => !cancelled && setOthers(data))
      .catch(() => !cancelled && setOthers([]));
    return () => {
      cancelled = true;
    };
  }, [userId, isOwn, token, me.friends.length]);

  const friends = isOwn ? me.friends : others;

  return (
    <WidgetWrapper>
      <Typography color={palette.neutral.dark} variant="h5" fontWeight="500" sx={{ mb: "1.5rem" }}>
        Friend List
      </Typography>
      <Box display="flex" flexDirection="column" gap="1.5rem" pb="0.75rem">
        {friends.length === 0 && (
          <Typography color={palette.neutral.medium}>
            {isOwn ? "No friends yet. Search for people and add them!" : "No friends yet."}
          </Typography>
        )}
        {friends.map((friend) => (
          <Friend
            key={friend._id}
            friendId={friend._id}
            name={`${friend.firstName} ${friend.lastName}`}
            subtitle={friend.occupation}
            userPicturePath={friend.picturePath}
          />
        ))}
      </Box>
    </WidgetWrapper>
  );
};

export default FriendListWidget;
