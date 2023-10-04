import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Box } from "@mui/material";
import { useToast } from "../contexts/ToastContext";

export default function AlertModal({ handleAction }) {
  const { alertModal, hideAlertDialog } = useToast();

  const { open, title, DialogMsg } = alertModal;
  //   const [open, setOpen] = React.useState(false);

  return (
    <Box>
      <Dialog
        open={open}
        onClose={hideAlertDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {DialogMsg}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={hideAlertDialog}>No</Button>
          <Button onClick={handleAction} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
