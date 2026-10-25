import { useEffect, useState } from "react";
import { Box, ClickAwayListener, IconButton, InputBase, Paper, Typography, useTheme } from "@mui/material";
import { Search } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { request } from "../../api";
import FlexBetween from "../../components/FlexBetween";
import UserImage from "../../components/UserImage";

const SearchBar = ({ onNavigate }) => {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [searched, setSearched] = useState(false);
  const token = useSelector((state) => state.token);
  const navigate = useNavigate();
  const { palette } = useTheme();

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults([]);
      setSearched(false);
      return undefined;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const data = await request(`/users/search?q=${encodeURIComponent(term)}`, {
          token,
          signal: ctrl.signal,
        });
        setResults(data);
        setSearched(true);
        setOpen(true);
      } catch (e) {
        if (e.name !== "AbortError") setResults([]);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q, token]);

  const go = (id) => {
    setOpen(false);
    setQ("");
    navigate(`/profile/${id}`);
    if (onNavigate) onNavigate();
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box position="relative">
        <FlexBetween
          backgroundColor={palette.neutral.light}
          borderRadius="9px"
          gap="3rem"
          padding="0.1rem 1.5rem"
        >
          <InputBase
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => q.trim() && setOpen(true)}
            inputProps={{ "aria-label": "Search people" }}
          />
          <IconButton aria-label="search" onClick={() => q.trim() && setOpen(true)}>
            <Search />
          </IconButton>
        </FlexBetween>
        {open && searched && (
          <Paper
            elevation={6}
            sx={{
              position: "absolute",
              top: "110%",
              left: 0,
              right: 0,
              zIndex: 20,
              p: "0.5rem",
              backgroundColor: palette.background.alt,
              minWidth: "240px",
            }}
          >
            {results.length === 0 ? (
              <Typography color={palette.neutral.medium} p="0.5rem">
                No people found
              </Typography>
            ) : (
              results.map((u) => (
                <Box
                  key={u._id}
                  onClick={() => go(u._id)}
                  display="flex"
                  alignItems="center"
                  gap="0.75rem"
                  p="0.5rem"
                  borderRadius="0.5rem"
                  sx={{ cursor: "pointer", "&:hover": { backgroundColor: palette.neutral.light } }}
                >
                  <UserImage image={u.picturePath} size="36px" />
                  <Box>
                    <Typography color={palette.neutral.dark} fontWeight="500">
                      {u.firstName} {u.lastName}
                    </Typography>
                    <Typography color={palette.neutral.medium} fontSize="0.7rem">
                      {u.occupation}
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default SearchBar;
