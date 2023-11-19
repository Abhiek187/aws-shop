import { Close } from "@mui/icons-material";
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef, Ref } from "react";

import FilterFields from "./FilterFields";

type MobileFilterProps = {
  open: boolean;
  onClose: () => void;
};

const MobileFilter = ({ open, onClose }: MobileFilterProps) => {
  const Transition = forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement;
    },
    ref: Ref<unknown>
  ) {
    return <Slide direction="down" ref={ref} {...props} />;
  });

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <Close />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Search
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "5px",
          my: 1,
          minWidth: "100%",
        }}
      >
        <FilterFields isMobile={true} />
      </Box>
    </Dialog>
  );
};

export default MobileFilter;
