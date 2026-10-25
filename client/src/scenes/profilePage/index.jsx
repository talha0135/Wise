import { Box, useMediaQuery } from "@mui/material";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import NavBar from "../navbar";
import FriendListWidget from "../widgets/FriendListWidget";
import MyPostWidget from "../widgets/MyPostWidget";
import PostsWidget from "../widgets/PostsWidget";
import UserWidget from "../widgets/UserWidget";

const ProfilePage = () => {
  const { userId } = useParams();
  const myId = useSelector((state) => state.user._id);
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const isOwn = userId === myId;

  return (
    <Box>
      <NavBar />
      <Box
        width="100%"
        padding="2rem 6%"
        display={isNonMobileScreens ? "flex" : "block"}
        gap="2rem"
        justifyContent="center"
      >
        <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
          <UserWidget userId={userId} trackView />
          <Box m="2rem 0" />
          <FriendListWidget userId={userId} />
        </Box>
        <Box flexBasis={isNonMobileScreens ? "42%" : undefined} mt={isNonMobileScreens ? undefined : "2rem"}>
          {isOwn && <MyPostWidget />}
          <PostsWidget userId={userId} isProfile />
        </Box>
      </Box>
    </Box>
  );
};

export default ProfilePage;
