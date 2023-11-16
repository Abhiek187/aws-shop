import {
  Button,
  CssBaseline,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";
import { teal, yellow } from "@mui/material/colors";
import { useSelector } from "react-redux";
import { Link, Route, Routes, useLocation } from "react-router-dom";

import TopBar from "./components/app-bar/TopBar";
import Store from "./components/store/Store";
import { selectApp } from "./store/appSlice";

const App = () => {
  const { mode } = useSelector(selectApp);
  const location = useLocation();

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: teal[500],
        light: "#33ab9f",
        dark: "#00695f",
      },
      secondary: {
        main: yellow[700],
        light: "#ffde33",
        dark: "#b29500",
      },
      contrastThreshold: 4.5, // minimum contrast for a11y
    },
  });

  return (
    <ThemeProvider theme={theme}>
      {/* Have the background color match the theme mode */}
      <CssBaseline />
      <Routes location={location}>
        <Route
          path="/"
          element={
            <>
              <header className="sticky top-0 z-10">
                <TopBar />
              </header>
              <main className="m-2">
                <Store />
              </main>
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <>
              <header>Profile</header>
              <main>My profile</main>
            </>
          }
        />
        <Route
          path="*"
          element={
            <main className="flex flex-col items-center gap-3">
              <Typography
                variant="h4"
                sx={{ mt: 3, mx: 3, textAlign: "center" }}
              >
                Whoops! This page doesn't exist.{" "}
              </Typography>
              <Link to="/">
                <Button variant="contained" color="secondary">
                  Back to safety
                </Button>
              </Link>
            </main>
          }
        />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
