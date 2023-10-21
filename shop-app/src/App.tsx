import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { teal, yellow } from "@mui/material/colors";
import { useSelector } from "react-redux";

import TopBar from "./components/app-bar/TopBar";
import Store from "./components/store/Store";
import { selectApp } from "./store/appSlice";

function App() {
  const { mode } = useSelector(selectApp);

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
      <header className="sticky top-0 z-10">
        <TopBar />
      </header>
      <main className="m-2">
        <Store />
      </main>
    </ThemeProvider>
  );
}

export default App;
