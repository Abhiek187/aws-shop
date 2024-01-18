import {
  LightMode,
  DarkMode,
  ShoppingCart,
  AccountCircle,
} from "@mui/icons-material";
import { Menu, MenuItem, IconButton } from "@mui/material";
import { MouseEvent } from "react";

import { selectApp } from "../../store/appSlice";
import { useAppSelector } from "../../store/hooks";

type MobileMenuProps = {
  id: string;
  anchorEl: null | HTMLElement;
  onClose: () => void;
  onToggleMode: () => void;
  onClickProfile: (event: MouseEvent<HTMLElement>) => void;
};

const MobileMenu = ({
  id,
  anchorEl,
  onClose,
  onToggleMode,
  onClickProfile,
}: Readonly<MobileMenuProps>) => {
  const { mode } = useAppSelector(selectApp);
  const isDarkMode = mode === "dark";
  const isMobileMenuOpen = Boolean(anchorEl);

  return (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={id}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={onClose}
    >
      <MenuItem onClick={onToggleMode}>
        <IconButton size="large" color="inherit">
          {isDarkMode ? <LightMode /> : <DarkMode />}
        </IconButton>
        <p>{`${isDarkMode ? "Light" : "Dark"} Mode`}</p>
      </MenuItem>
      <MenuItem>
        <IconButton size="large" color="inherit">
          <ShoppingCart />
        </IconButton>
        <p>Open Cart</p>
      </MenuItem>
      <MenuItem onClick={onClickProfile}>
        <IconButton
          size="large"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );
};

export default MobileMenu;
