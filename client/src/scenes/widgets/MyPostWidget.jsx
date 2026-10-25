import { useEffect, useMemo, useState } from "react";
import {
  AttachFileOutlined,
  Close,
  DeleteOutlined,
  GifBoxOutlined,
  ImageOutlined,
  MicOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputBase,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import { useDispatch, useSelector } from "react-redux";
import { addPost } from "../../state";
import { request } from "../../api";
import FlexBetween from "../../components/FlexBetween";
import UserImage from "../../components/UserImage";
import WidgetWrapper from "../../components/WidgetWrapper";

const ACCEPT = {
  image: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/gif": [".gif"], "image/webp": [".webp"] },
  clip: { "video/mp4": [".mp4"], "video/webm": [".webm"], "video/quicktime": [".mov"] },
  audio: {
    "audio/mpeg": [".mp3"],
    "audio/wav": [".wav"],
    "audio/ogg": [".ogg"],
    "audio/mp4": [".m4a"],
    "audio/webm": [".weba"],
  },
  attachment: {
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "application/vnd.ms-excel": [".xls"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    "application/vnd.ms-powerpoint": [".ppt"],
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
    "text/plain": [".txt"],
    "application/zip": [".zip"],
  },
};

const MyPostWidget = () => {
  const dispatch = useDispatch();
  const [kind, setKind] = useState("image");
  const [file, setFile] = useState(null);
  const [post, setPost] = useState("");
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);

  const { palette } = useTheme();
  const { picturePath } = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const mediumMain = palette.neutral.mediumMain;
  const medium = palette.neutral.medium;

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: ACCEPT[kind],
    multiple: false,
    maxSize: 50 * 1024 * 1024,
    noClick: true,
    noKeyboard: true,
    onDropAccepted: (files) => {
      setFile(files[0]);
      setError("");
    },
    onDropRejected: () => setError("That file type is not allowed here or it is larger than 50MB."),
  });

  const previewUrl = useMemo(
    () => (file && file.type.startsWith("image/") ? URL.createObjectURL(file) : ""),
    [file]
  );
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  // Pick a file type, then open the file chooser for that type on the next tick
  // (so the dropzone's `accept` is updated first).
  const choose = (k) => {
    setKind(k);
    setTimeout(open, 0);
  };

  const handlePost = async () => {
    setPosting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("description", post);
      if (file) formData.append("media", file);
      const created = await request("/posts", { method: "POST", token, form: formData });
      dispatch(addPost({ post: created }));
      setFile(null);
      setPost("");
    } catch (e) {
      setError(e.message);
    } finally {
      setPosting(false);
    }
  };

  const option = (k, Icon, label) => (
    <FlexBetween gap="0.25rem" onClick={() => choose(k)} sx={{ cursor: "pointer" }}>
      <Icon sx={{ color: kind === k && file ? palette.primary.main : mediumMain }} />
      {isNonMobileScreens && (
        <Typography color={mediumMain} sx={{ "&:hover": { cursor: "pointer", color: medium } }}>
          {label}
        </Typography>
      )}
    </FlexBetween>
  );

  return (
    <WidgetWrapper mb="2rem">
      <FlexBetween gap="1.5rem">
        <UserImage image={picturePath} />
        <InputBase
          placeholder="What's on your mind..."
          onChange={(e) => setPost(e.target.value)}
          value={post}
          multiline
          maxRows={4}
          inputProps={{ maxLength: 1000, "aria-label": "Post caption" }}
          sx={{
            width: "100%",
            backgroundColor: palette.neutral.light,
            borderRadius: "2rem",
            padding: "1rem 2rem",
          }}
        />
      </FlexBetween>

      <Box {...getRootProps()} sx={{ outline: "none" }}>
        <input {...getInputProps()} />
        {file && (
          <Box border={`1px solid ${palette.neutral.medium}`} borderRadius="5px" mt="1rem" p="1rem">
            <FlexBetween>
              <Typography sx={{ wordBreak: "break-all" }}>{file.name}</Typography>
              <IconButton onClick={() => setFile(null)} aria-label="Remove file">
                <DeleteOutlined />
              </IconButton>
            </FlexBetween>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="preview"
                style={{ width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 8, marginTop: 8 }}
              />
            )}
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: "1rem" }} action={<IconButton size="small" onClick={() => setError("")}><Close fontSize="small" /></IconButton>}>
          {error}
        </Alert>
      )}

      <Divider sx={{ margin: "1.25rem 0" }} />

      <FlexBetween>
        {option("image", ImageOutlined, "Image")}
        {option("clip", GifBoxOutlined, "Clip")}
        {option("attachment", AttachFileOutlined, "Attachment")}
        {option("audio", MicOutlined, "Audio")}
        <Button
          disabled={posting || (!post.trim() && !file)}
          onClick={handlePost}
          sx={{
            color: palette.background.alt,
            backgroundColor: palette.primary.main,
            borderRadius: "3rem",
            "&:hover": { backgroundColor: palette.primary.dark },
            "&.Mui-disabled": { backgroundColor: palette.neutral.light, color: palette.neutral.medium },
          }}
        >
          POST
        </Button>
      </FlexBetween>
    </WidgetWrapper>
  );
};

export default MyPostWidget;
