import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  EditOutlined,
  LocationOnOutlined,
  ManageAccountsOutlined,
  Twitter,
  LinkedIn,
  WorkOutlineOutlined,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { request } from "../../api";
import { setUser } from "../../state";
import UserImage from "../../components/UserImage";
import FlexBetween from "../../components/FlexBetween";
import WidgetWrapper from "../../components/WidgetWrapper";

const UserWidget = ({ userId, trackView = false }) => {
  const [user, setLocalUser] = useState(null);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ location: "", occupation: "", twitter: "", linkedin: "" });
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const { palette } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const me = useSelector((state) => state.user);
  const dark = palette.neutral.dark;
  const medium = palette.neutral.medium;
  const main = palette.neutral.main;
  const isOwn = userId === me._id;
  const viewedRef = useRef(null);

  // Refetch when the id changes or when my own friend list changes.
  useEffect(() => {
    let cancelled = false;
    setError("");
    // Count a profile view only once per visited profile (not on every refetch).
    const countView = trackView && !isOwn && viewedRef.current !== userId;
    if (countView) viewedRef.current = userId;
    const view = countView ? "?view=1" : "";
    request(`/users/${userId}${view}`, { token })
      .then((data) => !cancelled && setLocalUser(data))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, token, me.friends.length]);

  if (error) {
    return (
      <WidgetWrapper>
        <Alert severity="error">{error}</Alert>
      </WidgetWrapper>
    );
  }
  if (!user) {
    return (
      <WidgetWrapper>
        <Typography color={medium}>Loading...</Typography>
      </WidgetWrapper>
    );
  }

  const { firstName, lastName, location, occupation, viewedProfile, impressions, friends, picturePath, socials } = user;

  const openEdit = () => {
    setForm({
      location,
      occupation,
      twitter: socials?.twitter || "",
      linkedin: socials?.linkedin || "",
    });
    setSaveError("");
    setEditOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const updated = await request(`/users/${me._id}`, { method: "PATCH", token, body: form });
      setLocalUser(updated);
      dispatch(setUser(updated));
      setEditOpen(false);
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const socialRow = (Icon, title, subtitle, value) => (
    <FlexBetween gap="1rem" mb="0.5rem">
      <FlexBetween gap="1rem">
        <Icon sx={{ fontSize: "2rem", color: main }} />
        <Box>
          <Typography color={main} fontWeight="500">
            {title}
          </Typography>
          <Typography color={medium}>{value || subtitle}</Typography>
        </Box>
      </FlexBetween>
      {isOwn && (
        <IconButton onClick={openEdit} aria-label={`Edit ${title}`}>
          <EditOutlined sx={{ color: main }} />
        </IconButton>
      )}
    </FlexBetween>
  );

  return (
    <WidgetWrapper>
      <FlexBetween gap="0.5rem" pb="1.1rem">
        <FlexBetween gap="1rem" onClick={() => navigate(`/profile/${userId}`)}>
          <UserImage image={picturePath} />
          <Box>
            <Typography
              variant="h4"
              color={dark}
              fontWeight="500"
              sx={{ "&:hover": { color: palette.primary.main, cursor: "pointer" } }}
            >
              {firstName} {lastName}
            </Typography>
            <Typography color={medium}>{friends.length} friends</Typography>
          </Box>
        </FlexBetween>
        <IconButton onClick={() => (isOwn ? openEdit() : navigate(`/profile/${userId}`))} aria-label="Profile settings">
          <ManageAccountsOutlined />
        </IconButton>
      </FlexBetween>

      <Divider />

      <Box p="1rem 0">
        <Box display="flex" alignItems="center" gap="1rem" mb="0.5rem">
          <LocationOnOutlined fontSize="large" sx={{ color: main }} />
          <Typography color={medium}>{location}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap="1rem">
          <WorkOutlineOutlined fontSize="large" sx={{ color: main }} />
          <Typography color={medium}>{occupation}</Typography>
        </Box>
      </Box>

      <Divider />

      <Box p="1rem 0">
        <FlexBetween mb="0.5rem">
          <Typography color={medium}>Who's viewed your profile</Typography>
          <Typography color={main} fontWeight="500">
            {viewedProfile}
          </Typography>
        </FlexBetween>
        <FlexBetween>
          <Typography color={medium}>Impressions of your post</Typography>
          <Typography color={main} fontWeight="500">
            {impressions}
          </Typography>
        </FlexBetween>
      </Box>

      <Divider />

      <Box p="1rem 0">
        <Typography fontSize="1rem" color={main} fontWeight="500" mb="1rem">
          Social Profiles
        </Typography>
        {socialRow(Twitter, "Twitter", "Social Network", socials?.twitter)}
        {socialRow(LinkedIn, "Linkedin", "Network Platform", socials?.linkedin)}
      </Box>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Edit profile</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: "1rem", pt: "1rem !important" }}>
          <TextField label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} inputProps={{ maxLength: 100 }} />
          <TextField label="Occupation" value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} inputProps={{ maxLength: 100 }} />
          <TextField label="Twitter" value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} inputProps={{ maxLength: 100 }} />
          <TextField label="Linkedin" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} inputProps={{ maxLength: 100 }} />
          {saveError && <Alert severity="error">{saveError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </WidgetWrapper>
  );
};

export default UserWidget;
