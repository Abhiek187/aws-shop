import { Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="flex flex-col items-center gap-3">
      <Typography variant="h4" sx={{ mt: 3, mx: 3, textAlign: "center" }}>
        Whoops! This page doesn't exist.{" "}
      </Typography>
      <Link to="/">
        <Button variant="contained" color="secondary">
          Back to safety
        </Button>
      </Link>
    </main>
  );
};

export default NotFound;
