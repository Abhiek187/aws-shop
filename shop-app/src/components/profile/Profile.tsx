import type { WebAuthnCredentialDescription } from "@aws-sdk/client-cognito-identity-provider";
import { Cancel, CheckCircle, Close, Delete } from "@mui/icons-material";
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
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
import DeletePasskeyDialog from "./DeletePasskeyDialog";
import AccountSnackbar from "../app-bar/AccountSnackbar";

const Profile = () => {
  const { oauth } = useAppSelector(selectApp);
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState<
    WebAuthnCredentialDescription[]
  >([]);
  const [showPasskeyDialog, setShowPasskeyDialog] = useState(false);
  const [selectedPasskey, setSelectedPasskey] = useState<
    WebAuthnCredentialDescription | undefined
  >(undefined);
  const [showPasskeyAlert, setShowPasskeyAlert] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const [, idTokenPayload] = parseJWT<IdTokenPayload>(oauth.idToken);

  useEffect(() => {
    // Redirect back to the main page if the user isn't signed in
    if (idTokenPayload === undefined) {
      void navigate("/", { replace: true });
    }
  }, [idTokenPayload, navigate]);

  const fetchPasskeys = useCallback(async () => {
    const { CognitoIdentityProviderClient, ListWebAuthnCredentialsCommand } =
      await import("@aws-sdk/client-cognito-identity-provider");
    const cognito = new CognitoIdentityProviderClient({
      region: Constants.Cognito.REGION,
    });
    const listPasskeysCommand = new ListWebAuthnCredentialsCommand({
      AccessToken: oauth.accessToken,
    });

    try {
      const data = await cognito.send(listPasskeysCommand);
      setCredentials(data.Credentials ?? []);
    } catch (error) {
      console.error("List passkeys error:", error);
      setCredentials([]);
    }
  }, []);

  useEffect(() => {
    // Fetch passkeys if signed in
    if (oauth.accessToken.length > 0) {
      void fetchPasskeys();
    }
  }, [oauth.accessToken]);

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

  const handleOpenPasskeyDialog = (passkey: WebAuthnCredentialDescription) => {
    setSelectedPasskey(passkey);
    setShowPasskeyDialog(true);
  };

  const handleClosePasskeyDialog = () => {
    setShowPasskeyDialog(false);
    setSelectedPasskey(undefined);
  };

  const handleClosePasskeyAlert = () => {
    setShowPasskeyAlert(false);
  };

  const handleDeletePasskey = async (credentialId?: string) => {
    const { CognitoIdentityProviderClient, DeleteWebAuthnCredentialCommand } =
      await import("@aws-sdk/client-cognito-identity-provider");
    const cognito = new CognitoIdentityProviderClient({
      region: Constants.Cognito.REGION,
    });
    const deletePasskeyCommand = new DeleteWebAuthnCredentialCommand({
      AccessToken: oauth.accessToken,
      CredentialId: credentialId,
    });

    try {
      const data = await cognito.send(deletePasskeyCommand);
      console.log("Delete passkey success:", data);
      setCredentials((creds) =>
        creds.filter((cred) => cred.CredentialId !== credentialId)
      );

      handleClosePasskeyDialog();
      setDeleteSuccess(true);
    } catch (error) {
      console.error("Delete passkey error:", error);
      setDeleteSuccess(false);
    } finally {
      setShowPasskeyAlert(true);
    }
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
            <TableRow>
              <TableCell>
                <strong>Passkeys</strong>
              </TableCell>
              <TableCell align="right">
                {credentials.length === 0 ? (
                  "—"
                ) : (
                  <List>
                    {credentials.map((credential) => (
                      <ListItem
                        key={credential.CredentialId}
                        secondaryAction={
                          <IconButton
                            color="error"
                            edge="end"
                            onClick={() => handleOpenPasskeyDialog(credential)}
                            aria-label={`Delete passkey ${credential.FriendlyCredentialName}`}
                          >
                            <Delete />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={credential.FriendlyCredentialName}
                          secondary={`Created at: ${credential.CreatedAt?.toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </main>
      <DeletePasskeyDialog
        open={showPasskeyDialog}
        name={selectedPasskey?.FriendlyCredentialName ?? ""}
        onClose={handleClosePasskeyDialog}
        onDelete={() => void handleDeletePasskey(selectedPasskey?.CredentialId)}
      />
      <AccountSnackbar
        open={showPasskeyAlert}
        isSuccess={deleteSuccess}
        successMessage="Passkey deleted successfully!"
        errorMessage="Failed to delete the passkey, please try again later."
        onClose={handleClosePasskeyAlert}
      />
    </>
  );
};

export default Profile;
