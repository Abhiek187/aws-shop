import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
} from "@mui/material";
import { ChangeEvent, useRef, useState } from "react";

type DeleteAccountDialogProps = {
  open: boolean;
  email: string;
  onClose: () => void;
  onDelete: () => void;
};

const DeleteAccountDialog = ({
  open,
  email,
  onClose,
  onDelete,
}: DeleteAccountDialogProps) => {
  const emailFieldRef = useRef<HTMLInputElement>(null);
  const [emailValue, setEmailValue] = useState("");

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    setEmailValue(event.target.value);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Account</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete your account? Please type your email
          to confirm.
        </DialogContentText>
        <TextField
          ref={emailFieldRef}
          autoFocus
          margin="dense"
          label="Email Address"
          placeholder={email}
          type="email"
          fullWidth
          variant="standard"
          value={emailValue}
          onChange={handleInput}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          color="error"
          disabled={emailValue !== email}
          onClick={onDelete}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAccountDialog;
