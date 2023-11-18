import { Cancel, CheckCircle, Close } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { parseJWT } from "../../utils/oauth";
import { selectApp } from "../../store/appSlice";
import { AccessTokenPayload, IdTokenPayload } from "../../types/TokenPayload";

const Profile = () => {
  const { oauth } = useSelector(selectApp);
  const navigate = useNavigate();

  const [accessTokenHeader, accessTokenPayload] = parseJWT<AccessTokenPayload>(
    oauth.accessToken
  );
  const [idTokenHeader, idTokenPayload] = parseJWT<IdTokenPayload>(
    oauth.idToken
  );
  console.log("accessTokenHeader", accessTokenHeader);
  console.log("accessTokenPayload", accessTokenPayload);
  console.log("idTokenHeader", idTokenHeader);
  console.log("idTokenPayload", idTokenPayload);

  const handleCloseProfile = useCallback(() => {
    navigate(-1);
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
        <Typography variant="h3">Profile</Typography>
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
        <ul>
          <li>
            <strong>Username:</strong> {idTokenPayload?.["cognito:username"]}
          </li>
          <li>
            <strong>Email:</strong> {idTokenPayload?.email}
          </li>
          <li>
            <strong>Email Verified:</strong>{" "}
            {idTokenPayload?.email_verified ? (
              <>
                <CheckCircle color="success" />
                <Box component="span" sx={visuallyHidden}>
                  Email is verified
                </Box>
              </>
            ) : (
              <>
                <Cancel color="error" />
                <Box component="span" sx={visuallyHidden}>
                  Email is not verified
                </Box>
              </>
            )}
          </li>
        </ul>
      </main>
    </>
  );
};

export default Profile;
