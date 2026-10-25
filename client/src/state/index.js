import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "light",
  user: null,
  token: null,
  posts: [],
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
      state.posts = [];
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setFriends: (state, action) => {
      if (state.user) state.user.friends = action.payload.friends;
    },
    setPosts: (state, action) => {
      state.posts = action.payload.posts;
    },
    addPost: (state, action) => {
      state.posts.unshift(action.payload.post);
    },
    setPost: (state, action) => {
      state.posts = state.posts.map((p) =>
        p._id === action.payload.post._id ? action.payload.post : p
      );
    },
    removePost: (state, action) => {
      state.posts = state.posts.filter((p) => p._id !== action.payload.postId);
    },
  },
});

export const {
  setMode,
  setLogin,
  setLogout,
  setUser,
  setFriends,
  setPosts,
  addPost,
  setPost,
  removePost,
} = authSlice.actions;
export default authSlice.reducer;
