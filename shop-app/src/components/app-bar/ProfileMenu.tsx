import { Menu, Box, MenuItem, Divider } from "@mui/material";
import { useSelector } from "react-redux";

import { selectApp } from "../../store/appSlice";

type ProfileMenuProps = {
  id: string;
  anchorEl: null | HTMLElement;
  onClose: () => void;
  onClickProfile: () => void;
  onClickLogIn: () => void;
  onClickLogOut: () => void;
  onClickDeleteAccount: () => void;
};

const ProfileMenu = ({
  id,
  anchorEl,
  onClose,
  onClickProfile,
  onClickLogIn,
  onClickLogOut,
  onClickDeleteAccount,
}: Readonly<ProfileMenuProps>) => {
  const { isLoggedIn } = useSelector(selectApp);
  const isProfileMenuOpen = Boolean(anchorEl);

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
      open={isProfileMenuOpen}
      onClose={onClose}
    >
      {isLoggedIn ? (
        <Box>
          <MenuItem onClick={onClickProfile}>Profile</MenuItem>
          <MenuItem onClick={onClickLogOut}>Log Out</MenuItem>
          <Divider />
          <MenuItem sx={{ color: "error.main" }} onClick={onClickDeleteAccount}>
            Delete Account
          </MenuItem>
        </Box>
      ) : (
        <MenuItem onClick={onClickLogIn}>Log In</MenuItem>
      )}
    </Menu>
  );
};

export default ProfileMenu;
