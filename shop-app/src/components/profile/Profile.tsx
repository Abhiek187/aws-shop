import { Close } from "@mui/icons-material";
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

  const handleCloseProfile = () => {
    navigate(-1);
  };

  return (
    <>
      <header>Profile</header>
      <IconButton
        edge="end"
        color="inherit"
        onClick={handleCloseProfile}
        aria-label="close"
      >
        <Close />
      </IconButton>
      <main>
        <section>
          <Typography variant="h2">Access Token</Typography>
          <Typography variant="h3">Header</Typography>
          <ul>
            {Object.entries(accessTokenHeader ?? {}).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
          <Typography variant="h3">Payload</Typography>
          <ul>
            {Object.entries(accessTokenPayload ?? {}).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <Typography variant="h2">ID Token</Typography>
          <Typography variant="h3">Header</Typography>
          <ul>
            {Object.entries(idTokenHeader ?? {}).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
          <Typography variant="h3">Payload</Typography>
          <ul>
            {Object.entries(idTokenPayload ?? {}).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
};

export default Profile;
