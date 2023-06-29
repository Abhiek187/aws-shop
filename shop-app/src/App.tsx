import { Provider } from "react-redux";
import Store from "./components/store/Store";
import store from "./store";
import { Typography } from "@mui/material";

function App() {
  return (
    <Provider store={store}>
      <header>
        <Typography variant="h2" component="h1" align="center">
          AWS Shop
        </Typography>
      </header>
      <main>
        <Store />
      </main>
    </Provider>
  );
}

export default App;
