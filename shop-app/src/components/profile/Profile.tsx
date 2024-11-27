import { Cancel, CheckCircle, Close } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { parseJWT } from "../../utils/oauth";
import { selectApp } from "../../store/appSlice";
import { IdTokenPayload } from "../../types/TokenPayload";
import { useAppSelector } from "../../store/hooks";

const Profile = () => {
  const { oauth } = useAppSelector(selectApp);
  const navigate = useNavigate();

  const [, idTokenPayload] = parseJWT<IdTokenPayload>(oauth.idToken);

  useEffect(() => {
    // Redirect back to the main page if the user isn't signed in
    if (idTokenPayload === undefined) {
      void navigate("/", { replace: true });
    }
  }, [idTokenPayload, navigate]);

  const handleCloseProfile = useCallback(() => {
    void navigate(-1);
  }, [navigate]);

  useEffect(() => {
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Escape") {
        handleCloseProfile();
      }
    };

    window.addEventListener("keyup", handleKeyUp);
    return () => window.removeEventListener("keyup", handleKeyUp);
  }, [handleCloseProfile]);

  return (
    <>
      <header className="flex justify-between items-center m-6">
        <Typography variant="h4">Profile</Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleCloseProfile}
          aria-label="close profile"
          className="w-10 h-10"
        >
          <Close />
        </IconButton>
      </header>
      <main>
        <Table sx={{ width: { sm: "75%", lg: "50%" }, mx: { sm: "auto" } }}>
          <TableBody>
            <TableRow>
              <TableCell>
                <strong>Username</strong>
              </TableCell>
              <TableCell align="right">
                {idTokenPayload?.["cognito:username"]}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
              <TableCell align="right">{idTokenPayload?.email}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <strong>Email Verified</strong>
              </TableCell>
              {idTokenPayload?.email_verified === true ? (
                <TableCell align="right">
                  <CheckCircle color="success" />
                  <Box component="span" sx={visuallyHidden}>
                    Email is verified
                  </Box>
                </TableCell>
              ) : (
                <TableCell align="right">
                  <Cancel color="error" />
                  <Box component="span" sx={visuallyHidden}>
                    Email is not verified
                  </Box>
                </TableCell>
              )}
            </TableRow>
          </TableBody>
        </Table>
      </main>
    </>
  );
};

export default Profile;
