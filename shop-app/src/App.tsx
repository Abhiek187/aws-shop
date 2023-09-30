import Store from "./components/store/Store";
import { Typography } from "@mui/material";

function App() {
  return (
    <>
      <header>
        <Typography variant="h2" component="h1" align="center">
          AWS Shop
        </Typography>
      </header>
      <main>
        <Store />
      </main>
    </>
  );
}

export default App;
