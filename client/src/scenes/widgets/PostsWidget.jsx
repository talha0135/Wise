import { useEffect, useState } from "react";
import { Alert, Typography, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "../../state";
import { request } from "../../api";
import PostWidget from "./PostWidget";
import WidgetWrapper from "../../components/WidgetWrapper";

const PostsWidget = ({ userId, isProfile = false }) => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts);
  const token = useSelector((state) => state.token);
  const { palette } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    dispatch(setPosts({ posts: [] }));
    const path = isProfile ? `/posts/user/${userId}` : "/posts";
    request(path, { token })
      .then((data) => !cancelled && dispatch(setPosts({ posts: data })))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [userId, isProfile, token, dispatch]);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (loading) return <Typography color={palette.neutral.medium}>Loading posts...</Typography>;
  if (posts.filter((post) => post.author).length === 0) {
    return (
      <WidgetWrapper>
        <Typography color={palette.neutral.medium}>
          {isProfile ? "No posts yet." : "No posts yet. Be the first to spill the tea!"}
        </Typography>
      </WidgetWrapper>
    );
  }

  return (
    <>
      {posts.filter((post) => post.author).map((post) => (
        <PostWidget key={post._id} post={post} />
      ))}
    </>
  );
};

export default PostsWidget;
