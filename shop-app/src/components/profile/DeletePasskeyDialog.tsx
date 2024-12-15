import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

type DeletePasskeyDialogProps = {
  open: boolean;
  name: string;
  onClose: () => void;
  onDelete: () => void;
};

const DeletePasskeyDialog = ({
  open,
  name,
  onClose,
  onDelete,
}: Readonly<DeletePasskeyDialogProps>) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Passkey</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this passkey? {name}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" onClick={onDelete}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeletePasskeyDialog;
