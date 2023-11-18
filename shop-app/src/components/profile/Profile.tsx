import { Cancel, CheckCircle, Close } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
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

  const handleCloseProfile = () => {
    navigate(-1);
  };

  return (
    <>
      <header className="flex justify-between items-center m-3">
        <Typography variant="h3">Profile</Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleCloseProfile}
          aria-label="close"
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
              <CheckCircle color="success" />
            ) : (
              <Cancel color="error" />
            )}
          </li>
        </ul>
      </main>
    </>
  );
};

export default Profile;
