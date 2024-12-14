import type { WebAuthnCredentialDescription } from "@aws-sdk/client-cognito-identity-provider";
import { Cancel, CheckCircle, Close, Delete } from "@mui/icons-material";
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
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { parseJWT } from "../../utils/oauth";
import { selectApp } from "../../store/appSlice";
import { IdTokenPayload } from "../../types/TokenPayload";
import { useAppSelector } from "../../store/hooks";
import { Constants } from "../../utils/constants";

const Profile = () => {
  const { oauth } = useAppSelector(selectApp);
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState<
    WebAuthnCredentialDescription[]
  >([]);

  const [, idTokenPayload] = parseJWT<IdTokenPayload>(oauth.idToken);

  useEffect(() => {
    // Redirect back to the main page if the user isn't signed in
    if (idTokenPayload === undefined) {
      void navigate("/", { replace: true });
    }
  }, [idTokenPayload, navigate]);

  const fetchPasskeys = useCallback(async () => {
    const { CognitoIdentityProvider } = await import(
      "@aws-sdk/client-cognito-identity-provider"
    );
    const cognito = new CognitoIdentityProvider({
      region: Constants.Cognito.REGION,
    });

    cognito.listWebAuthnCredentials(
      {
        AccessToken: oauth.accessToken,
      },
      (error, data) => {
        if (error !== null) {
          console.error("List passkeys error:", error);
        } else {
          console.log("List passkeys success:", data);
          setCredentials(data?.Credentials ?? []);
        }
      }
    );
  }, []);

  useEffect(() => {
    void fetchPasskeys();
  }, []);

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

  const handleDeletePasskey = async (credentialId?: string) => {
    const { CognitoIdentityProvider } = await import(
      "@aws-sdk/client-cognito-identity-provider"
    );
    const cognito = new CognitoIdentityProvider({
      region: Constants.Cognito.REGION,
    });

    cognito.deleteWebAuthnCredential(
      {
        AccessToken: oauth.accessToken,
        CredentialId: credentialId,
      },
      (error, data) => {
        if (error !== null) {
          console.error("Delete passkey error:", error);
        } else {
          console.log("Delete passkey success:", data);
          setCredentials((creds) =>
            creds.filter((cred) => cred.CredentialId !== credentialId)
          );
        }
      }
    );
  };

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
        <Typography variant="h4">Passkeys</Typography>
        <ul>
          {credentials.map((credential) => (
            <li key={credential.CredentialId} className="flex gap-3">
              <p>{credential.FriendlyCredentialName}</p>
              <p className="italic">
                Created at: {credential.CreatedAt?.toLocaleDateString()}
              </p>
              <IconButton
                color="error"
                onClick={() =>
                  void handleDeletePasskey(credential.CredentialId)
                }
                aria-label={`Delete passkey ${credential.FriendlyCredentialName}`}
              >
                <Delete />
              </IconButton>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
};

export default Profile;
