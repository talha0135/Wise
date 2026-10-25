import { useEffect, useMemo } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme";
import { request, setUnauthorizedHandler } from "./api";
import { setLogout, setUser } from "./state";
import LoginPage from "./scenes/loginPage";
import HomePage from "./scenes/homePage";
import ProfilePage from "./scenes/profilePage";

function App() {
  const mode = useSelector((state) => state.mode);
  const token = useSelector((state) => state.token);
  const dispatch = useDispatch();
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const isAuth = Boolean(token);

  // Log out automatically if the server says the token is no longer valid.
  useEffect(() => {
    setUnauthorizedHandler(() => dispatch(setLogout()));
  }, [dispatch]);

  // Refresh the stored user (friends, stats) from the database on app start.
  useEffect(() => {
    if (!token) return;
    request("/auth/me", { token })
      .then((user) => dispatch(setUser(user)))
      .catch(() => {});
  }, [token, dispatch]);

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/" element={isAuth ? <Navigate to="/home" replace /> : <LoginPage />} />
          <Route path="/home" element={isAuth ? <HomePage /> : <Navigate to="/" replace />} />
          <Route
            path="/profile/:userId"
            element={isAuth ? <ProfilePage /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
