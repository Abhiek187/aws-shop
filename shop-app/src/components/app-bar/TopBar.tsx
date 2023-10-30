import {
  AccountCircle,
  Close,
  DarkMode,
  FilterList,
  LightMode,
  MoreVert,
  Search,
  ShoppingCart,
} from "@mui/icons-material";
import {
  Box,
  Toolbar,
  IconButton,
  Typography,
  AppBar,
  InputBase,
  alpha,
  styled,
  Menu,
  MenuItem,
  Slide,
  Dialog,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { ChangeEvent, MouseEvent, Ref, forwardRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import FilterFields from "./FilterFields";
import { appActions, selectApp } from "../../store/appSlice";

const SearchWrapper = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
  flexGrow: 1,
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
  },
}));

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const TopBar = () => {
  // Save form state to URL, easier to share & better SEO compared to useState
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") ?? "";

  const { mode } = useSelector(selectApp);
  const isDarkMode = mode === "dark";
  const dispatch = useDispatch();

  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const isProfileMenuOpen = Boolean(profileAnchorEl);
  const isMobileMenuOpen = Boolean(mobileMenuAnchorEl);

  const handleToggleMode = () => {
    dispatch(appActions.toggleMode());
  };

  const handleProfileMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleFilterOpen = () => {
    setFilterOpen(true);
  };

  const handleFilterClose = () => {
    setFilterOpen(false);
  };

  const updateSearchParams = (key: string, value: string) => {
    setSearchParams(
      (params) => {
        // Don't add a query parameter if it's empty
        if (value.length > 0) {
          params.set(key, value);
        } else {
          params.delete(key);
        }

        return params;
      },
      {
        replace: true, // don't undo every character change when navigating back and forward
      }
    );
  };

  const onChangeQuery = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateSearchParams("query", event.target.value);
  };

  const profileMenuId = "profile-menu";
  const renderProfileMenu = (
    <Menu
      anchorEl={profileAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={profileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isProfileMenuOpen}
      onClose={handleProfileMenuClose}
    >
      <MenuItem onClick={handleProfileMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleProfileMenuClose}>My Account</MenuItem>
    </Menu>
  );

  const renderMobileFilter = (
    <Dialog
      fullScreen
      open={filterOpen}
      onClose={handleFilterClose}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleFilterClose}
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

  const mobileMenuId = "mobile-menu";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMenuAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleToggleMode}>
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
      <MenuItem onClick={handleProfileMenuOpen}>
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

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            // Don't show the app name on small screens
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            AWS Shop
          </Typography>
          <SearchWrapper>
            <SearchIconWrapper>
              <Search />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              id="query"
              type="search"
              inputMode="search"
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={onChangeQuery}
            />
          </SearchWrapper>
          {/* Show the other menu buttons on large screens */}
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <IconButton
              size="large"
              aria-label={`switch to ${isDarkMode ? "light" : "dark"} mode`}
              onClick={handleToggleMode}
              color="inherit"
            >
              {isDarkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
            <IconButton size="large" aria-label="open cart" color="inherit">
              <ShoppingCart />
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={profileMenuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
          {/* On small screens, show a filter and triple dot icon */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="filter search"
              onClick={handleFilterOpen}
              color="inherit"
            >
              <FilterList />
            </IconButton>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreVert />
            </IconButton>
          </Box>
        </Toolbar>
        <Toolbar
          className="justify-around"
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          <FilterFields isMobile={false} />
        </Toolbar>
      </AppBar>
      {renderMobileFilter}
      {renderMobileMenu}
      {renderProfileMenu}
    </Box>
  );
};

export default TopBar;
