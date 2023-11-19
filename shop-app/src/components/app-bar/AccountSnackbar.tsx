import { Snackbar, Alert } from "@mui/material";

type AccountSnackbarProps = {
  open: boolean;
  isSuccess: boolean;
  successMessage: string;
  errorMessage: string;
  onClose: () => void;
};

const AccountSnackbar = ({
  open,
  isSuccess,
  successMessage,
  errorMessage,
  onClose,
}: AccountSnackbarProps) => {
  return (
    <Snackbar open={open} autoHideDuration={5000} onClose={onClose}>
      <Alert
        onClose={onClose}
        severity={isSuccess ? "success" : "error"}
        variant="filled"
      >
        {isSuccess ? successMessage : errorMessage}
      </Alert>
    </Snackbar>
  );
};

export default AccountSnackbar;
