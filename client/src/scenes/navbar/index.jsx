import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Close,
  DarkMode,
  Help,
  LightMode,
  Menu as MenuIcon,
  Notifications,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setLogout, setMode } from "../../state";
import { request, timeAgo } from "../../api";
import FlexBetween from "../../components/FlexBetween";
import SearchBar from "./SearchBar";

const SEEN_KEY = "wise_notifications_seen";

const NavBar = () => {
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [seenAt, setSeenAt] = useState(() => Number(localStorage.getItem(SEEN_KEY)) || 0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const dark = theme.palette.neutral.dark;
  const background = theme.palette.background.default;
  const primaryLight = theme.palette.primary.light;
  const alt = theme.palette.background.alt;

  const fullName = `${user.firstName} ${user.lastName}`;

  const loadNotifications = useCallback(async () => {
    try {
      setNotifications(await request("/posts/notifications", { token }));
    } catch {
      /* notifications are optional; ignore failures */
    }
  }, [token]);

  useEffect(() => {
    loadNotifications();
    const id = setInterval(loadNotifications, 60000);
    return () => clearInterval(id);
  }, [loadNotifications]);

  const unread = notifications.filter((n) => new Date(n.createdAt).getTime() > seenAt).length;

  const openNotifications = (e) => {
    setNotifAnchor(e.currentTarget);
    loadNotifications();
    const now = Date.now();
    localStorage.setItem(SEEN_KEY, String(now));
    setSeenAt(now);
  };

  const handleConfirmLogout = () => {
    setOpenLogoutDialog(false);
    dispatch(setLogout());
    navigate("/", { state: { loggedOut: true } });
  };

  const onUserMenu = (e) => {
    if (e.target.value === "profile") navigate(`/profile/${user._id}`);
    if (e.target.value === "logout") setOpenLogoutDialog(true);
    setIsMobileMenuToggled(false);
  };

  const actions = (direction) => (
    <FlexBetween gap={direction === "column" ? "2rem" : "1.5rem"} flexDirection={direction} alignItems="center">
      <IconButton onClick={() => dispatch(setMode())} aria-label="Toggle light/dark mode">
        {theme.palette.mode === "dark" ? (
          <DarkMode sx={{ fontSize: "25px" }} />
        ) : (
          <LightMode sx={{ color: dark, fontSize: "25px" }} />
        )}
      </IconButton>
      <IconButton onClick={openNotifications} aria-label="Notifications">
        <Badge badgeContent={unread} color="primary">
          <Notifications sx={{ fontSize: "25px" }} />
        </Badge>
      </IconButton>
      <IconButton onClick={() => setHelpOpen(true)} aria-label="Help">
        <Help sx={{ fontSize: "25px" }} />
      </IconButton>
      <FormControl variant="standard">
        <Select
          value=""
          displayEmpty
          renderValue={() => <Typography>{fullName}</Typography>}
          onChange={onUserMenu}
          sx={{
            backgroundColor: neutralLight,
            width: "170px",
            borderRadius: "0.25rem",
            p: "0.25rem 1rem",
            "& .MuiSvgIcon-root": { pr: "0.25rem", width: "3rem" },
            "& .MuiSelect-select:focus": { backgroundColor: neutralLight },
          }}
          input={<InputBase />}
        >
          <MenuItem value="profile">My Profile</MenuItem>
          <MenuItem value="logout">Log Out</MenuItem>
        </Select>
      </FormControl>
    </FlexBetween>
  );

  return (
    <FlexBetween padding="1rem 6%" backgroundColor={alt} position="sticky" top={0} zIndex={50}>
      <FlexBetween gap="1.75rem">
        <Typography
          fontWeight="bold"
          fontSize="clamp(1rem, 2rem, 2.25rem)"
          color="primary"
          onClick={() => navigate("/home")}
          sx={{ "&:hover": { color: primaryLight, cursor: "pointer" } }}
        >
          WISE
        </Typography>
        {isNonMobileScreens && <SearchBar />}
      </FlexBetween>

      {isNonMobileScreens ? (
        actions("row")
      ) : (
        <IconButton onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)} aria-label="Menu">
          <MenuIcon />
        </IconButton>
      )}

      {!isNonMobileScreens && isMobileMenuToggled && (
        <Box
          position="fixed"
          right="0"
          bottom="0"
          height="100%"
          zIndex="60"
          maxWidth="500px"
          minWidth="260px"
          backgroundColor={background}
          boxShadow="-4px 0 20px rgba(0,0,0,0.25)"
        >
          <Box display="flex" justifyContent="flex-end" p="1rem">
            <IconButton onClick={() => setIsMobileMenuToggled(false)} aria-label="Close menu">
              <Close />
            </IconButton>
          </Box>
          <Box px="1.5rem" mb="2rem">
            <SearchBar onNavigate={() => setIsMobileMenuToggled(false)} />
          </Box>
          <Box display="flex" justifyContent="center">
            {actions("column")}
          </Box>
        </Box>
      )}

      <Menu
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={() => setNotifAnchor(null)}
        PaperProps={{ sx: { width: 320, maxHeight: 400 } }}
      >
        <Typography fontWeight="600" px="1rem" py="0.5rem">
          Notifications
        </Typography>
        {notifications.length === 0 ? (
          <Typography px="1rem" py="0.5rem" color={theme.palette.neutral.medium}>
            Nothing yet. Likes and comments on your posts will show up here.
          </Typography>
        ) : (
          <List dense disablePadding>
            {notifications.map((n) => (
              <ListItem key={n.id}>
                <ListItemText primary={n.text} secondary={timeAgo(n.createdAt)} />
              </ListItem>
            ))}
          </List>
        )}
      </Menu>

      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>How WISE works</DialogTitle>
        <DialogContent>
          <DialogContentText component="div" sx={{ lineHeight: 1.8 }}>
            Write a caption and attach a photo, clip, audio or file to post.
            <br />
            Tap the heart to like or unlike, and the bubble to comment.
            <br />
            Use the person icon next to anyone to add or remove them from your friends.
            <br />
            Search people from the top bar and open their profile.
            <br />
            Toggle the sun/moon icon for light or dark mode.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpOpen(false)}>Got it</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openLogoutDialog} onClose={() => setOpenLogoutDialog(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to log out?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogoutDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmLogout} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </FlexBetween>
  );
};

export default NavBar;
