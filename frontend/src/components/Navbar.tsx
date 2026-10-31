import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Menu,
    MenuItem,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    useState,
} from "react";

import {
    useAuth,
} from "../contexts/AuthContext";

export default function Navbar() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] =
        useState<null | HTMLElement>(null);

    function handleMenuOpen(
        event: React.MouseEvent<HTMLElement>
    ) {
        setAnchorEl(
            event.currentTarget
        );
    }


    function handleMenuClose() {
        setAnchorEl(null);
    }

    async function handleLogout() {
        handleMenuClose();
        await logout();
        navigate("/");
    }

    return (
        <AppBar
            position="static"
            elevation={2}
        >
            <Toolbar
                sx={{
                    minHeight: {
                        xs: 60, sm: 64,
                    },

                    px: {
                        xs: 1.5, sm: 2, md: 3,
                    },
                }}
            >
                {/* APPLICATION TITLE */}

                <Typography
                    variant="h6"
                    sx={{
                        flexGrow: 1,
                        fontWeight: "bold",
                        fontSize: {
                            xs: "1rem", sm: "1.25rem",
                        },

                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        mr: 1,
                    }}
                >
                    🎬 Movie Booking System
                </Typography>

                {/* DESKTOP NAVIGATION */}

                <Box
                    sx={{
                        display: {
                            xs: "none", md: "flex",
                        },

                        gap: 1,
                        alignItems: "center",
                    }}
                >
                    <Button
                        color="inherit"
                        component={Link}
                        to="/home"
                    >
                        Movies
                    </Button>

                    <Button
                        color="inherit"
                        component={Link}
                        to="/bookings"
                    >
                        My Bookings
                    </Button>

                    <Button
                        color="inherit"
                        component={Link}
                        to="/profile"
                    >
                        Profile
                    </Button>

                    <Button
                        color="inherit"
                        onClick={
                            handleLogout
                        }
                    >
                        Logout
                    </Button>
                </Box>

                {/* MOBILE MENU BUTTON */}

                <IconButton
                    color="inherit"
                    edge="end"
                    onClick={
                        handleMenuOpen
                    }
                    sx={{
                        display: {
                            xs: "flex", md: "none",
                        },
                    }}
                    aria-label="open navigation menu"
                >
                    <MenuIcon />
                </IconButton>

                {/* MOBILE MENU */}

                <Menu
                    anchorEl={anchorEl}
                    open={
                        Boolean(anchorEl)
                    }
                    onClose={
                        handleMenuClose
                    }
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                    }}
                >

                    <MenuItem
                        component={Link}
                        to="/home"
                        onClick={
                            handleMenuClose
                        }
                    >
                        Movies
                    </MenuItem>

                    <MenuItem
                        component={Link}
                        to="/bookings"
                        onClick={
                            handleMenuClose
                        }
                    >
                        My Bookings
                    </MenuItem>

                    <MenuItem
                        component={Link}
                        to="/profile"
                        onClick={
                            handleMenuClose
                        }
                    >
                        Profile
                    </MenuItem>

                    <MenuItem
                        onClick={
                            handleLogout
                        }
                    >
                        Logout
                    </MenuItem>

                </Menu>
            </Toolbar>
        </AppBar>
    );
}