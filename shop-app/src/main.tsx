import {
  StyledEngineProvider,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { teal, yellow } from "@mui/material/colors";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import App from "./App.tsx";
import "./index.css";
import store from "./store";
import { BrowserRouter } from "react-router-dom";

const theme = createTheme({
  palette: {
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

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Inject Emotion before JSS to override Material UI styles */}
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <App />
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    </BrowserRouter>
  </React.StrictMode>
);
