import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { teal, yellow } from "@mui/material/colors";
import { Route, Routes, useLocation } from "react-router-dom";

import TopBar from "./components/app-bar/TopBar";
import Store from "./components/store/Store";
import { selectApp } from "./store/appSlice";
import Profile from "./components/profile/Profile";
import NotFound from "./components/404/NotFound";
import { useAppSelector } from "./store/hooks";

const App = () => {
  const { mode } = useAppSelector(selectApp);
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
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
