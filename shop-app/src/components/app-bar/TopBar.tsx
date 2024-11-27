import {
  AccountCircle,
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
} from "@mui/material";
import {
  ChangeEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import FilterFields from "./FilterFields";
import { appActions, selectApp } from "../../store/appSlice";
import { isValidJWT, openHostedUI, parseJWT } from "../../utils/oauth";
import {
  useGetTokenMutation,
  useRevokeTokenMutation,
} from "../../services/auth";
import { Constants } from "../../utils/constants";
import DeleteAccountDialog from "./DeleteAccountDialog";
import { IdTokenPayload } from "../../types/TokenPayload";
import AccountSnackbar from "./AccountSnackbar";
import MobileFilter from "./MobileFilter";
import MobileMenu from "./MobileMenu";
import ProfileMenu from "./ProfileMenu";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { usePublishEventMutation } from "../../services/store";
import { appBarEvent, profileEvent } from "../../utils/analytics";

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

const TopBar = () => {
  // Save form state to URL, easier to share & better SEO compared to useState
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const navigate = useNavigate();

  const { isLoggedIn, mode, oauth } = useAppSelector(selectApp);
  const isDarkMode = mode === "dark";
  const dispatch = useAppDispatch();

  const [revokeToken, logoutResult] = useRevokeTokenMutation();
  const [refreshToken, refreshResult] = useGetTokenMutation();
  const [publishEvent] = usePublishEventMutation();

  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const profileMenuId = "profile-menu";
  const mobileMenuId = "mobile-menu";

  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [accountEmail, setAccountEmail] = useState<string | undefined>(
    undefined
  );

  const handleOpenProfile = useCallback(async () => {
    // Check if the access & ID tokens are present & valid
    const isValidAccessToken = await isValidJWT(oauth.accessToken);
    const isValidIdToken = await isValidJWT(oauth.idToken);

    if (isValidAccessToken && isValidIdToken) {
      void publishEvent(
        profileEvent({
          viewedProfile: true,
        })
      );
      await navigate("/profile");
    } else {
      // If not, try refreshing them
      await refreshToken({
        refresh: true,
        next: Constants.TokenActions.PROFILE,
      });
    }
  }, [navigate, oauth.accessToken, oauth.idToken, refreshToken]);

  const handleOpenAccountDialog = useCallback(async () => {
    const isValidAccessToken = await isValidJWT(oauth.accessToken);
    const isValidIdToken = await isValidJWT(oauth.idToken);

    if (isValidAccessToken && isValidIdToken) {
      // Confirm if the user want to delete their account first
      setShowAccountDialog(true);

      const [, idTokenPayload] = parseJWT<IdTokenPayload>(oauth.idToken);
      setAccountEmail(idTokenPayload?.email);
    } else {
      await refreshToken({
        refresh: true,
        next: Constants.TokenActions.DELETE_ACCOUNT,
      });
    }
  }, [oauth.accessToken, oauth.idToken, refreshToken]);

  useEffect(() => {
    if (logoutResult.data !== undefined) {
      // Reset back to a logged out state
      localStorage.removeItem(Constants.LocalStorage.REFRESH_TOKEN);
      dispatch(appActions.logOut());
      setShowLogoutAlert(true);
    } else if (logoutResult.error !== undefined) {
      setShowLogoutAlert(true);
    }
  }, [dispatch, logoutResult]);

  useEffect(() => {
    if (refreshResult.data !== undefined) {
      // If refresh succeeded, save the tokens and resume the action
      dispatch(
        appActions.saveTokens({
          accessToken: refreshResult.data.access_token,
          idToken: refreshResult.data.id_token,
        })
      );

      const args = refreshResult.originalArgs;

      if (args?.next === Constants.TokenActions.PROFILE) {
        void handleOpenProfile();
      } else if (args?.next === Constants.TokenActions.DELETE_ACCOUNT) {
        void handleOpenAccountDialog();
      }
    } else if (refreshResult.error !== undefined) {
      // If refresh failed, log out
      dispatch(appActions.logOut());
    }
  }, [dispatch, handleOpenAccountDialog, handleOpenProfile, refreshResult]);

  const handleToggleMode = () => {
    // Publish the event as the opposite of whether it's light or dark mode when toggling
    void publishEvent(
      appBarEvent({
        darkMode: !isDarkMode,
      })
    );
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

  const handleSignIn = async () => {
    void publishEvent(
      profileEvent({
        loggedIn: true,
      })
    );
    await openHostedUI();
  };

  const handleSignOut = async () => {
    void publishEvent(
      profileEvent({
        loggedOut: true,
      })
    );
    await revokeToken();
  };

  const handleCloseAccountDialog = () => {
    setShowAccountDialog(false);
  };

  const handleDeleteAccount = async () => {
    // Dynamically import the AWS SDK to improve the build size
    const { CognitoIdentityProvider } = await import(
      "@aws-sdk/client-cognito-identity-provider"
    );
    const cognito = new CognitoIdentityProvider({
      region: Constants.Cognito.REGION,
    });

    cognito.deleteUser(
      {
        AccessToken: oauth.accessToken,
      },
      (error, data) => {
        if (error !== null) {
          console.error("Delete error:", error);
          setDeleteSuccess(false);
        } else {
          console.log("Delete success:", data);
          setDeleteSuccess(true);
          void handleSignOut();
          handleCloseAccountDialog();
        }

        setShowDeleteAlert(true);
      }
    );
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

  const handleCloseLogoutAlert = () => {
    setShowLogoutAlert(false);
  };

  const handleCloseDeleteAlert = () => {
    setShowDeleteAlert(false);
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
      <MobileFilter open={filterOpen} onClose={handleFilterClose} />
      <MobileMenu
        id={mobileMenuId}
        anchorEl={mobileMenuAnchorEl}
        onClose={handleMobileMenuClose}
        onToggleMode={handleToggleMode}
        onClickProfile={handleProfileMenuOpen}
      />
      <ProfileMenu
        id={profileMenuId}
        anchorEl={profileAnchorEl}
        onClose={handleProfileMenuClose}
        onClickProfile={() => void handleOpenProfile()}
        onClickLogIn={() => void handleSignIn()}
        onClickLogOut={() => void handleSignOut()}
        onClickDeleteAccount={() => void handleOpenAccountDialog()}
      />
      <DeleteAccountDialog
        open={showAccountDialog}
        email={accountEmail ?? ""}
        onClose={handleCloseAccountDialog}
        onDelete={() => void handleDeleteAccount()}
      />
      <AccountSnackbar
        open={showLogoutAlert}
        isSuccess={!isLoggedIn}
        successMessage="Logged out successfully!"
        errorMessage="Failed to log out, please try again later."
        onClose={handleCloseLogoutAlert}
      />
      <AccountSnackbar
        open={showDeleteAlert}
        isSuccess={deleteSuccess}
        successMessage="Account deleted successfully!"
        errorMessage="Failed to delete account, please try again later."
        onClose={handleCloseDeleteAlert}
      />
    </Box>
  );
};

export default TopBar;
