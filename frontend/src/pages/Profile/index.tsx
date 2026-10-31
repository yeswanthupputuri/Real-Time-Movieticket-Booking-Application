import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../../contexts/AuthContext";

import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import LockIcon from "@mui/icons-material/Lock";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import MovieIcon from "@mui/icons-material/Movie";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EventIcon from "@mui/icons-material/Event";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import ChairIcon from "@mui/icons-material/Chair";

import {
    getAdminMovies,
    updateMovie,
} from "../../services/movieService";

import {
    getDashboardStatistics,
    type AdminDashboard,
} from "../../services/adminService";

import type {
    Movie,
} from "../../types/movie";

import {
    createShow,
    updateShow,
    cancelShow,
    getShowsByMovie,
    type CreateShowPayload,
} from "../../services/showService";

import type { Show } from "../../types/show";


export default function Profile() {

    const {
        user,
        role,
        updateUsername,
        changePassword,
    } = useAuth();


    const navigate = useNavigate();
    const isAdmin = role?.toLowerCase() === "admin";
    const [accountInfoDialogOpen, setAccountInfoDialogOpen] = useState(false);
    const [ usernameDialogOpen, setUsernameDialogOpen,] = useState(false);
    const [
        newUsername, setNewUsername,
    ] = useState( user?.displayName ?? "" );
    const [
        usernameLoading, setUsernameLoading,
    ] = useState(false);


    const [
        usernameError, setUsernameError,
    ] = useState("");

    const [
        usernameSuccess, setUsernameSuccess,
    ] = useState("");

    const [
        passwordDialogOpen, setPasswordDialogOpen,
    ] = useState(false);

    const [
        currentPassword, setCurrentPassword,
    ] = useState("");

    const [
        newPassword, setNewPassword,
    ] = useState("");

    const [
        confirmPassword, setConfirmPassword,
    ] = useState("");

    const [
        passwordLoading, setPasswordLoading,
    ] = useState(false);

    const [
        passwordError, setPasswordError,
    ] = useState("");


    const [
        passwordSuccess, setPasswordSuccess,
    ] = useState("");

    const [
        dashboard, setDashboard,
    ] = useState<AdminDashboard | null>(null);

    const [
        dashboardLoading, setDashboardLoading,
    ] = useState(false);


    const [
        dashboardError, setDashboardError,
    ] = useState("");

    const [
        adminMovies, setAdminMovies,
    ] = useState<Movie[]>([]);

    const [
        moviesLoading, setMoviesLoading,
    ] = useState(false);


    const [
        moviesError, setMoviesError,
    ] = useState("");

    const [
        addShowDialogOpen, setAddShowDialogOpen,
    ] = useState(false);

    const [
        selectedShowMovie, setSelectedShowMovie,
    ] = useState<Movie | null>(null);

    const [showTheatre, setShowTheatre] = useState("");
    const [showCity, setShowCity] = useState("");
    const [showScreen, setShowScreen] = useState("");
    const [showDate, setShowDate] = useState("");
    const [showTime, setShowTime] = useState("");
    const [showPrice, setShowPrice] = useState("");

    const [
        createShowLoading,
        setCreateShowLoading,
    ] = useState(false);

    const [createShowError, setCreateShowError] = useState("");
    const [createShowSuccess, setCreateShowSuccess] = useState("");

    const [viewShowsDialogOpen, setViewShowsDialogOpen] = useState(false);
    const [viewShowsMovie, setViewShowsMovie] = useState<Movie | null>(null);
    const [movieShows, setMovieShows] = useState<Show[]>([]);
    const [movieShowsLoading, setMovieShowsLoading] = useState(false);
    const [movieShowsError, setMovieShowsError] = useState("");

    // Edit Show Dialog
 
    const [editShowDialogOpen, setEditShowDialogOpen] = useState(false);
    const [editingShow, setEditingShow] = useState<Show | null>(null);
    const [editShowTheatre, setEditShowTheatre] = useState("");
    const [editShowCity, setEditShowCity] = useState("");
    const [editShowScreen, setEditShowScreen] = useState("");
    const [editShowDate, setEditShowDate] = useState("");
    const [editShowTime, setEditShowTime] = useState("");
    const [editShowPrice, setEditShowPrice] = useState("");
    const [editShowLoading, setEditShowLoading] = useState(false);
    const [editShowError, setEditShowError] = useState("");
    const [editShowSuccess, setEditShowSuccess] = useState("");
    
    // Cancel Show

    const [cancelShowDialogOpen, setCancelShowDialogOpen] = useState(false);
    const [showToCancel, setShowToCancel] = useState<Show | null>(null);
    const [cancelShowLoading, setCancelShowLoading] = useState(false);
    const [cancelShowError, setCancelShowError] = useState("");

    function openCancelShowDialog(show: Show) {
        setShowToCancel(show);
        setCancelShowError("");
        setCancelShowDialogOpen(true);
    }

    function closeCancelShowDialog() {
        if (cancelShowLoading) return;
        setCancelShowDialogOpen(false);
        setShowToCancel(null);
        setCancelShowError("");
    }

    async function handleCancelShow() {
        if (!showToCancel || !viewShowsMovie) {
            setCancelShowError("Show or movie information is missing. Please close and try again.");
            return;
        }

        setCancelShowLoading(true);
        setCancelShowError("");

        try {
            await cancelShow(showToCancel._id);
            const refreshedShows = await getShowsByMovie(viewShowsMovie._id, true);
            setMovieShows(refreshedShows);

            try {
                const dashboardData = await getDashboardStatistics();
                setDashboard(dashboardData);
                setDashboardError("");
            } catch (refreshError) {
                console.error("Show cancelled, but dashboard refresh failed:", refreshError);
            }

            setCancelShowDialogOpen(false);
            setShowToCancel(null);
        } catch (error: any) {
            console.error("Failed to cancel show:", error);
            setCancelShowError(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to cancel the show. Please try again."
            );
        } finally {
            setCancelShowLoading(false);
        }
    }

    // Edit Movie Dialog

    const [
        editMovieDialogOpen, setEditMovieDialogOpen,
    ] = useState(false);

    const [
        selectedMovie, setSelectedMovie,
    ] = useState<Movie | null>(null);

    const [
        editTitle, setEditTitle,
    ] = useState("");

    const [
        editDescription, setEditDescription,
    ] = useState("");


    const [
        editGenre, setEditGenre,
    ] = useState("");

    const [
        editLanguage, setEditLanguage,
    ] = useState("");

    const [
        editDuration, setEditDuration,
    ] = useState("");

    const [
        editPoster, setEditPoster,
    ] = useState<File | null>(null);


    const [
        editMovieLoading,
        setEditMovieLoading,
    ] = useState(false);


    const [
        editMovieError,
        setEditMovieError,
    ] = useState("");


    const [
        editMovieSuccess,
        setEditMovieSuccess,
    ] = useState("");

    // Load Admin Data

    useEffect(() => {
        if (!isAdmin) {
            return;
        }
        loadAdminData();
    }, [isAdmin]);


    async function loadAdminData() {
        setDashboardLoading(true);
        setMoviesLoading(true);
        setDashboardError("");
        setMoviesError("");

        try {
            const dashboardData =
                await getDashboardStatistics();
            setDashboard(
                dashboardData
            );

        } catch (error) {
            console.error(
                "Failed to load dashboard:",
                error
            );

            setDashboardError(
                error instanceof Error
                    ? error.message
                    : "Failed to load dashboard statistics."
            );

        } finally {
            setDashboardLoading(false);
        }

        try {
            const movies =
                await getAdminMovies();
            setAdminMovies(
                movies
            );

        } catch (error) {
            console.error(
                "Failed to load admin movies:",
                error
            );

            setMoviesError(
                error instanceof Error
                    ? error.message
                    : "Failed to load movies."
            );

        } finally {
            setMoviesLoading(false);
        }
    }

    // Open Add Show Dialog
  
    function openAddShowDialog(movie: Movie) {
        setSelectedShowMovie(movie);
        setShowTheatre("");
        setShowCity("");
        setShowScreen("");
        setShowDate("");
        setShowTime("");
        setShowPrice("");
        setCreateShowError("");
        setCreateShowSuccess("");
        setAddShowDialogOpen(true);
    }


    // Close Add Show Dialog

    function closeAddShowDialog() {
        if (createShowLoading) {
            return;
        }

        setAddShowDialogOpen(false);
        setSelectedShowMovie(null);
        setCreateShowError("");
        setCreateShowSuccess("");
    }


    // View Shows For A Movie

    async function openViewShowsDialog(movie: Movie) {
        setViewShowsMovie(movie);
        setMovieShows([]);
        setMovieShowsError("");
        setViewShowsDialogOpen(true);
        setMovieShowsLoading(true);

        try {
            const shows = await getShowsByMovie(movie._id, true);
            setMovieShows(shows);
        } catch (error) {
            console.error("Failed to load movie shows:", error);
            setMovieShowsError(
                error instanceof Error
                    ? error.message
                    : "Failed to load shows for this movie."
            );
        } finally {
            setMovieShowsLoading(false);
        }
    }

    function closeViewShowsDialog() {
        setViewShowsDialogOpen(false);
        setViewShowsMovie(null);
        setMovieShows([]);
        setMovieShowsError("");
    }


    // Edit Show
    function openEditShowDialog(show: Show) {
        setEditingShow(show);
        setEditShowTheatre(show.theatre ?? "");
        setEditShowCity(show.city ?? "");
        setEditShowScreen(show.screen ?? "");
        setEditShowDate(show.show_date ?? "");
        setEditShowTime((show.show_time ?? "").slice(0, 5));
        setEditShowPrice(String(show.price ?? ""));
        setEditShowError("");
        setEditShowSuccess("");
        setViewShowsDialogOpen(false);
        setEditShowDialogOpen(true);
    }

    function closeEditShowDialog() {
        if (editShowLoading) return;
        setEditShowDialogOpen(false);
        setEditingShow(null);
        setEditShowError("");
        setEditShowSuccess("");
    }

    async function handleUpdateShow() {
        setEditShowError("");
        setEditShowSuccess("");

        if (!editingShow || !viewShowsMovie) {
            setEditShowError("Show or movie information is missing. Close this dialog and try again.");
            return;
        }

        const theatre = editShowTheatre.trim();
        const city = editShowCity.trim();
        const screen = editShowScreen.trim();
        const price = Number(editShowPrice);

        if (!theatre || !city || !screen || !editShowDate || !editShowTime || !editShowPrice.trim()) {
            setEditShowError("Please complete all show fields.");
            return;
        }

        if (!Number.isInteger(price) || price < 1) {
            setEditShowError("Ticket price must be a positive whole number.");
            return;
        }

        const payload: CreateShowPayload = {
            movie_id: viewShowsMovie._id,
            theatre,
            city,
            screen,
            show_date: editShowDate,
            show_time: editShowTime,
            price,
        };

        try {
            setEditShowLoading(true);
            const result = await updateShow(editingShow._id, payload);
            setEditShowSuccess(result?.message || "Show updated successfully.");

            // Refresh the show list after a successful update.
            const refreshedShows = await getShowsByMovie(viewShowsMovie._id, true);
            setMovieShows(refreshedShows);

            // Refresh dashboard totals in case the backend's statistics include show counts.
            try {
                const dashboardData = await getDashboardStatistics();
                setDashboard(dashboardData);
                setDashboardError("");
            } catch (refreshError) {
                console.error("Show updated, but dashboard refresh failed:", refreshError);
            }

            window.setTimeout(() => {
                setEditShowDialogOpen(false);
                setEditingShow(null);
                setEditShowSuccess("");
                setViewShowsDialogOpen(true);
            }, 700);
        } catch (error) {
            console.error("Show update failed:", error);
            setEditShowError(
                error instanceof Error
                    ? error.message
                    : "Failed to update show. Please try again."
            );
        } finally {
            setEditShowLoading(false);
        }
    }

    // Create Show
    async function handleCreateShow() {
        setCreateShowError("");
        setCreateShowSuccess("");

        if (!selectedShowMovie) {
            setCreateShowError("Please select a movie first.");
            return;
        }

        const theatre = showTheatre.trim();
        const city = showCity.trim();
        const screen = showScreen.trim();
        const price = Number(showPrice);

        if (!theatre || !city || !screen || !showDate || !showTime || !showPrice.trim()) {
            setCreateShowError("Please complete all show fields.");
            return;
        }

        if (!Number.isInteger(price) || price < 1) {
            setCreateShowError("Ticket price must be a positive whole number.");
            return;
        }

        const payload: CreateShowPayload = {
            movie_id: selectedShowMovie._id,
            theatre,
            city,
            screen,
            show_date: showDate,
            show_time: showTime,
            price,
        };

        try {
            setCreateShowLoading(true);

            const result = await createShow(payload);
            setCreateShowSuccess(
                result?.message || "Show created successfully."
            );

            // Refresh dashboard statistics after the show is created.
            try {
                const dashboardData = await getDashboardStatistics();
                setDashboard(dashboardData);
                setDashboardError("");
            } catch (refreshError) {
                console.error("Show created, but dashboard refresh failed:", refreshError);
                setDashboardError(
                    "Show was created, but dashboard statistics could not be refreshed. Reload the page to update them."
                );
            }

            // Give the success message a moment to be visible before closing.
            window.setTimeout(() => {
                setAddShowDialogOpen(false);
                setSelectedShowMovie(null);
                setCreateShowSuccess("");
            }, 900);
        } catch (error) {
            console.error("Show creation failed:", error);

            const responseMessage = (
                error as {
                    response?: {
                        data?: {
                            detail?: string;
                            message?: string;
                        };
                    };
                }
            )?.response?.data;

            setCreateShowError(
                responseMessage?.detail ||
                responseMessage?.message ||
                (error instanceof Error
                    ? error.message
                    : "Failed to create show. Please try again.")
            );
        } finally {
            setCreateShowLoading(false);
        }
    }

    // Open Username Dialog
  
    function openUsernameDialog() {

        setNewUsername(
            user?.displayName ?? ""
        );

        setUsernameError("");
        setUsernameSuccess("");
        setUsernameDialogOpen(true);

    }

    // Close Username Dialog
  
    function closeUsernameDialog() {

        if (usernameLoading) {
            return;
        }

        setUsernameDialogOpen(false);

        setUsernameError("");

    }


    // Update Username

    async function handleUsernameUpdate() {
        const username = newUsername.trim();
        if (!username) {
            setUsernameError(
                "Username cannot be empty."
            );
            return;
        }


        if (username.length < 3) {
            setUsernameError(
                "Username must be at least 3 characters."
            );
            return;
        }


        if (username.length > 30) {
            setUsernameError(
                "Username cannot exceed 30 characters."
            );
            return;
        }


        if ( username === user?.displayName
        ) {
            setUsernameError(
                "This is already your current username."
            );
            return;
        }

        try {

            setUsernameLoading(true);
            setUsernameError("");
            setUsernameSuccess("");

            await updateUsername(
                username
            );

            setUsernameSuccess(
                "Username updated successfully."
            );

            setTimeout(() => {
                setUsernameDialogOpen(
                    false
                );
                setUsernameSuccess("");
            }, 1000);


        } catch (error) {

            console.error(
                "Username update failed:",
                error
            );

            setUsernameError(
                error instanceof Error
                    ? error.message
                    : "Failed to update username."
            );

        } finally {
            setUsernameLoading(false);

        }
    }

    // Open Password Dialog

    function openPasswordDialog() {

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setPasswordError("");
        setPasswordSuccess("");

        setPasswordDialogOpen(true);

    }

    // Close Password Dialog

    function closePasswordDialog() {
        if (passwordLoading) {
            return;
        }
        setPasswordDialogOpen(false);
        setPasswordError("");

    }


    // Change Password
    async function handlePasswordChange() {

        setPasswordError("");
        setPasswordSuccess("");

        if (!currentPassword) {
            setPasswordError(
                "Please enter your current password."
            );
            return;

        }


        if (!newPassword) {
            setPasswordError(
                "Please enter a new password."
            );

            return;
        }

        if (newPassword.length < 6) {

            setPasswordError(
                "New password must be at least 6 characters."
            );

            return;
        }


        if (
            newPassword ===
            currentPassword
        ) {

            setPasswordError(
                "New password must be different from your current password."
            );

            return;

        }


        if (
            newPassword !==
            confirmPassword
        ) {

            setPasswordError(
                "New passwords do not match."
            );

            return;

        }


        try {

            setPasswordLoading(true);


            await changePassword(
                currentPassword,
                newPassword
            );


            setPasswordSuccess(
                "Password changed successfully."
            );


            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");


            setTimeout(() => {

                setPasswordDialogOpen(
                    false
                );

                setPasswordSuccess("");

            }, 1200);


        } catch (error) {

            console.error(
                "Password change failed:",
                error
            );


            setPasswordError(
                error instanceof Error
                    ? error.message
                    : "Failed to change password."
            );

        } finally {

            setPasswordLoading(false);

        }

    }


    // =====================================================
    // Open Edit Movie Dialog
    // =====================================================

    function openEditMovieDialog(
        movie: Movie
    ) {

        setSelectedMovie(
            movie
        );


        setEditTitle(
            movie.title
        );


        setEditDescription(
            movie.description
        );


        setEditGenre(
            movie.genre
        );


        setEditLanguage(
            movie.language
        );


        setEditDuration(
            String(
                movie.duration
            )
        );


        setEditPoster(
            null
        );


        setEditMovieError("");
        setEditMovieSuccess("");


        setEditMovieDialogOpen(
            true
        );

    }


    // =====================================================
    // Close Edit Movie Dialog
    // =====================================================

    function closeEditMovieDialog() {

        if (editMovieLoading) {
            return;
        }


        setEditMovieDialogOpen(
            false
        );

        setSelectedMovie(
            null
        );

        setEditMovieError("");
        setEditMovieSuccess("");
        setEditPoster(null);

    }

    // Edit Movie Poster
    function handlePosterChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {

        const file =
            event.target.files?.[0];


        if (!file) {
            return;
        }


        if (!file.type.startsWith("image/")) {

            setEditMovieError(
                "Please select a valid image file."
            );

            return;

        }


        setEditMovieError("");

        setEditPoster(
            file
        );

    }

    // Update Movie

    async function handleMovieUpdate() {

        if (!selectedMovie) {
            return;
        }


        setEditMovieError("");
        setEditMovieSuccess("");


        const title =
            editTitle.trim();


        const description =
            editDescription.trim();


        const genre =
            editGenre.trim();


        const language =
            editLanguage.trim();


        const duration =
            Number(
                editDuration
            );


        // Validation

        if (!title) {

            setEditMovieError(
                "Movie title cannot be empty."
            );

            return;

        }


        if (!description) {

            setEditMovieError(
                "Movie description cannot be empty."
            );

            return;

        }


        if (!genre) {

            setEditMovieError(
                "Genre cannot be empty."
            );

            return;

        }


        if (!language) {

            setEditMovieError(
                "Language cannot be empty."
            );

            return;

        }


        if (
            !editDuration ||
            !Number.isInteger(duration) ||
            duration <= 0
        ) {

            setEditMovieError(
                "Duration must be a valid positive number."
            );

            return;

        }


        try {

            setEditMovieLoading(true);

            // FormData

            const formData =
                new FormData();


            formData.append(
                "title",
                title
            );


            formData.append(
                "description",
                description
            );


            formData.append(
                "genre",
                genre
            );


            formData.append(
                "language",
                language
            );


            formData.append(
                "duration",
                String(duration)
            );


            if (editPoster) {

                formData.append(
                    "poster",
                    editPoster
                );

            }

            // Backend update

            await updateMovie(
                selectedMovie._id,
                formData
            );


            setEditMovieSuccess(
                "Movie updated successfully."
            );

            // Refresh admin movie list

            const updatedMovies =
                await getAdminMovies();


            setAdminMovies(
                updatedMovies
            );

            // Close after success

            setTimeout(() => {

                setEditMovieDialogOpen(
                    false
                );

                setSelectedMovie(
                    null
                );

                setEditMovieSuccess("");

                setEditPoster(null);

            }, 1000);


        } catch (error) {

            console.error(
                "Movie update failed:",
                error
            );


            setEditMovieError(

                error instanceof Error
                    ? error.message
                    : "Failed to update movie."
            );

        } finally {

            setEditMovieLoading(false);

        }

    }

    // Render

    return (

        <Box
            sx={{
                maxWidth: 1000,
                mx: "auto",
                py: {
                    xs: 2,
                    sm: 4,
                },
                px: {
                    xs: 1,
                    sm: 2,
                },
            }}
        >

            {/* PROFILE HEADER */}

            <Card
                elevation={3}
                sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                }}
            >

                <CardContent
                    sx={{
                        p: {
                            xs: 3,
                            sm: 4,
                        },
                    }}
                >

                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        textAlign="center"
                    >

                        <Avatar
                            sx={{
                                width: 90,
                                height: 90,
                                mb: 2,
                                fontSize: "2rem",
                                fontWeight: "bold",
                            }}
                        >

                            {user?.displayName
                                ?.charAt(0)
                                ?.toUpperCase()}

                        </Avatar>


                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            sx={{
                                fontSize: {
                                    xs: "1.8rem",
                                    sm: "2.2rem",
                                },
                            }}
                        >

                            {user?.displayName}

                        </Typography>


                        <Typography
                            color="text.secondary"
                            mt={0.5}
                        >

                            {user?.email}

                        </Typography>


                        <Typography
                            color="text.secondary"
                            mt={1}
                        >

                            Role:{" "}

                            <strong>
                                {role ?? "User"}
                            </strong>

                        </Typography>

                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1.5}
                            sx={{
                                mt: 3,
                                width: "100%",
                                maxWidth: 760,
                                justifyContent: "center",
                            }}
                        >
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={() => setAccountInfoDialogOpen(true)}
                                sx={{ flex: 1 }}
                            >
                                Account Information
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<LockIcon />}
                                onClick={openPasswordDialog}
                                sx={{ flex: 1 }}
                            >
                                Change Password
                            </Button>

                            {isAdmin && (
                                <Button
                                    variant="contained"
                                    startIcon={<MovieIcon />}
                                    onClick={() => navigate("/admin")}
                                    sx={{ flex: 1 }}
                                >
                                    Create Movie
                                </Button>
                            )}
                        </Stack>

                    </Box>

                </CardContent>

            </Card>


            {/* ADMIN SECTION */}

            {isAdmin && (

                <>

                    {/* REVENUE DASHBOARD */}

                    <Card
                        elevation={2}
                        sx={{
                            mt: 3,
                            borderRadius: 3,
                        }}
                    >

                        <CardContent
                            sx={{
                                p: {
                                    xs: 2.5,
                                    sm: 3,
                                },
                            }}
                        >

                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                mb={1}
                            >

                                <AdminPanelSettingsIcon />

                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                >

                                    Admin Dashboard

                                </Typography>

                            </Stack>


                            <Typography
                                color="text.secondary"
                                mb={3}
                            >

                                Dashboard statistics for
                                movies managed by you.

                            </Typography>


                            {dashboardError && (

                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 2,
                                    }}
                                >

                                    {dashboardError}

                                </Alert>

                            )}


                            {dashboardLoading ? (

                                <Box
                                    display="flex"
                                    justifyContent="center"
                                    py={4}
                                >

                                    <CircularProgress />

                                </Box>

                            ) : dashboard ? (

                                <Grid
                                    container
                                    spacing={2}
                                >

                                    {/* Total Movies */}

                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 6,
                                            md: 3,
                                        }}
                                    >

                                        <Card
                                            variant="outlined"
                                        >

                                            <CardContent>

                                                <MovieIcon />

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    mt={1}
                                                >

                                                    My Movies

                                                </Typography>


                                                <Typography
                                                    variant="h5"
                                                    fontWeight="bold"
                                                >

                                                    {
                                                        dashboard.total_movies
                                                    }

                                                </Typography>

                                            </CardContent>

                                        </Card>

                                    </Grid>


                                    {/* Total Shows */}

                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 6,
                                            md: 3,
                                        }}
                                    >

                                        <Card
                                            variant="outlined"
                                        >

                                            <CardContent>

                                                <EventIcon />

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    mt={1}
                                                >

                                                    Total Shows

                                                </Typography>


                                                <Typography
                                                    variant="h5"
                                                    fontWeight="bold"
                                                >

                                                    {
                                                        dashboard.total_shows
                                                    }

                                                </Typography>

                                            </CardContent>

                                        </Card>

                                    </Grid>


                                    {/* Total Bookings */}

                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 6,
                                            md: 3,
                                        }}
                                    >

                                        <Card
                                            variant="outlined"
                                        >

                                            <CardContent>

                                                <ConfirmationNumberIcon />

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    mt={1}
                                                >

                                                    Bookings

                                                </Typography>


                                                <Typography
                                                    variant="h5"
                                                    fontWeight="bold"
                                                >

                                                    {
                                                        dashboard.total_bookings
                                                    }

                                                </Typography>

                                            </CardContent>

                                        </Card>

                                    </Grid>


                                    {/* Revenue */}

                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 6,
                                            md: 3,
                                        }}
                                    >

                                        <Card
                                            variant="outlined"
                                        >

                                            <CardContent>

                                                <AttachMoneyIcon />

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    mt={1}
                                                >

                                                    Revenue

                                                </Typography>


                                                <Typography
                                                    variant="h5"
                                                    fontWeight="bold"
                                                >

                                                    ₹
                                                    {
                                                        dashboard.total_revenue
                                                    }

                                                </Typography>

                                            </CardContent>

                                        </Card>

                                    </Grid>


                                    {/* Confirmed Bookings */}

                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 6,
                                            md: 3,
                                        }}
                                    >

                                        <Card
                                            variant="outlined"
                                        >

                                            <CardContent>

                                                <ConfirmationNumberIcon />

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    mt={1}
                                                >

                                                    Confirmed

                                                </Typography>


                                                <Typography
                                                    variant="h5"
                                                    fontWeight="bold"
                                                >

                                                    {
                                                        dashboard.confirmed_bookings
                                                    }

                                                </Typography>

                                            </CardContent>

                                        </Card>

                                    </Grid>


                                    {/* Total Seats */}

                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 6,
                                            md: 3,
                                        }}
                                    >

                                        <Card
                                            variant="outlined"
                                        >

                                            <CardContent>

                                                <ChairIcon />

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    mt={1}
                                                >

                                                    Total Seats

                                                </Typography>


                                                <Typography
                                                    variant="h5"
                                                    fontWeight="bold"
                                                >

                                                    {
                                                        dashboard.total_seats
                                                    }

                                                </Typography>

                                            </CardContent>

                                        </Card>

                                    </Grid>


                                    {/* Booked Seats */}

                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 6,
                                            md: 3,
                                        }}
                                    >

                                        <Card
                                            variant="outlined"
                                        >

                                            <CardContent>

                                                <ChairIcon />

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    mt={1}
                                                >

                                                    Booked Seats

                                                </Typography>


                                                <Typography
                                                    variant="h5"
                                                    fontWeight="bold"
                                                >

                                                    {
                                                        dashboard.booked_seats
                                                    }

                                                </Typography>

                                            </CardContent>

                                        </Card>

                                    </Grid>


                                    {/* Available Seats */}

                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 6,
                                            md: 3,
                                        }}
                                    >

                                        <Card
                                            variant="outlined"
                                        >

                                            <CardContent>

                                                <ChairIcon />

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    mt={1}
                                                >

                                                    Available Seats

                                                </Typography>


                                                <Typography
                                                    variant="h5"
                                                    fontWeight="bold"
                                                >

                                                    {
                                                        dashboard.available_seats
                                                    }

                                                </Typography>

                                            </CardContent>

                                        </Card>

                                    </Grid>

                                </Grid>

                            ) : null}

                        </CardContent>

                    </Card>


                    {/*  MY MOVIES*/}

                    <Card
                        elevation={2}
                        sx={{
                            mt: 3,
                            borderRadius: 3,
                        }}
                    >

                        <CardContent
                            sx={{
                                p: {
                                    xs: 2.5,
                                    sm: 3,
                                },
                            }}
                        >

                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                mb={1}
                            >

                                <MovieIcon />

                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                >

                                    My Movies

                                </Typography>

                            </Stack>


                            <Typography
                                color="text.secondary"
                                mb={3}
                            >

                                Movies created and managed
                                by your admin account.

                            </Typography>


                            {moviesError && (

                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 2,
                                    }}
                                >

                                    {moviesError}

                                </Alert>

                            )}


                            {moviesLoading ? (

                                <Box
                                    display="flex"
                                    justifyContent="center"
                                    py={4}
                                >

                                    <CircularProgress />

                                </Box>

                            ) : adminMovies.length === 0 ? (

                                <Alert
                                    severity="info"
                                >

                                    You have not created
                                    any movies yet.

                                </Alert>

                            ) : (

                                <Grid
                                    container
                                    spacing={2}
                                >

                                    {adminMovies.map(
                                        (movie) => (

                                            <Grid
                                                key={
                                                    movie._id
                                                }
                                                size={{
                                                    xs: 12,
                                                    sm: 6,
                                                    md: 4,
                                                }}
                                            >

                                                <Card
                                                    variant="outlined"
                                                    sx={{
                                                        height: "100%",
                                                        display: "flex",
                                                        flexDirection:
                                                            "column",
                                                    }}
                                                >

                                                    {/* Poster */}

                                                    <Box
                                                        sx={{
                                                            height: 280,
                                                            backgroundColor:
                                                                "grey.200",
                                                            overflow:
                                                                "hidden",
                                                        }}
                                                    >

                                                        <Box
                                                            component="img"
                                                            src={
                                                                movie.poster
                                                            }
                                                            alt={
                                                                movie.title
                                                            }
                                                            sx={{
                                                                width:
                                                                    "100%",
                                                                height:
                                                                    "100%",
                                                                objectFit:
                                                                    "cover",
                                                            }}
                                                            onError={(
                                                                event
                                                            ) => {

                                                                event.currentTarget.style.display =
                                                                    "none";

                                                            }}
                                                        />

                                                    </Box>


                                                    <CardContent
                                                        sx={{
                                                            flexGrow: 1,
                                                        }}
                                                    >

                                                        <Typography
                                                            variant="h6"
                                                            fontWeight="bold"
                                                            gutterBottom
                                                        >

                                                            {
                                                                movie.title
                                                            }

                                                        </Typography>


                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            mb={1}
                                                        >

                                                            {
                                                                movie.genre
                                                            }

                                                        </Typography>


                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >

                                                            {
                                                                movie.language
                                                            }

                                                        </Typography>


                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >

                                                            Duration:{" "}

                                                            {
                                                                movie.duration
                                                            }{" "}

                                                            minutes

                                                        </Typography>


                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                mt: 1,
                                                                display:
                                                                    "-webkit-box",
                                                                WebkitLineClamp:
                                                                    3,
                                                                WebkitBoxOrient:
                                                                    "vertical",
                                                                overflow:
                                                                    "hidden",
                                                            }}
                                                        >

                                                            {
                                                                movie.description
                                                            }

                                                        </Typography>

                                                    </CardContent>


                                                    <Box
                                                        sx={{
                                                            p: 2,
                                                        }}
                                                    >
                                                        <Stack spacing={1}>
                                                            <Button
                                                                variant="contained"
                                                                fullWidth
                                                                startIcon={<AddCircleOutlineIcon />}
                                                                onClick={() => openAddShowDialog(movie)}
                                                            >
                                                                Add Show
                                                            </Button>

                                                            <Button
                                                                variant="outlined"
                                                                fullWidth
                                                                startIcon={<VisibilityIcon />}
                                                                onClick={() => void openViewShowsDialog(movie)}
                                                            >
                                                                View Shows
                                                            </Button>

                                                            <Button
                                                                variant="outlined"
                                                                fullWidth
                                                                startIcon={<EditIcon />}
                                                                onClick={() => openEditMovieDialog(movie)}
                                                            >
                                                                Edit Movie
                                                            </Button>
                                                        </Stack>
                                                    </Box>

                                                </Card>

                                            </Grid>

                                        )
                                    )}

                                </Grid>

                            )}

                        </CardContent>

                    </Card>



                </>

            )}


            {/* ACCOUNT INFORMATION DIALOG */}

            <Dialog
                open={accountInfoDialogOpen}
                onClose={() => setAccountInfoDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Account Information</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2.5} sx={{ pt: 1 }}>
                        <Box>
                            <Typography variant="body2" color="text.secondary" mb={0.5}>
                                Username
                            </Typography>
                            <Typography fontWeight="medium" sx={{ wordBreak: "break-word" }}>
                                {user?.displayName || "Not set"}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="body2" color="text.secondary" mb={0.5}>
                                Email
                            </Typography>
                            <Typography fontWeight="medium" sx={{ wordBreak: "break-word" }}>
                                {user?.email || "Not available"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Email is managed by your sign-in provider and cannot be edited here.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="body2" color="text.secondary" mb={0.5}>
                                Role
                            </Typography>
                            <Typography fontWeight="medium">
                                {role ?? "User"}
                            </Typography>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setAccountInfoDialogOpen(false)}>
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => {
                            setAccountInfoDialogOpen(false);
                            openUsernameDialog();
                        }}
                    >
                        Edit Username
                    </Button>
                </DialogActions>
            </Dialog>


            {/*  USERNAME DIALOG */}

            <Dialog
                open={
                    usernameDialogOpen
                }
                onClose={
                    closeUsernameDialog
                }
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle>

                    Edit Username

                </DialogTitle>


                <DialogContent>

                    <TextField
                        autoFocus
                        fullWidth
                        label="Username"
                        value={
                            newUsername
                        }
                        onChange={(event) =>
                            setNewUsername(
                                event.target.value
                            )
                        }
                        margin="normal"
                        disabled={
                            usernameLoading
                        }
                        error={
                            Boolean(
                                usernameError
                            )
                        }
                        helperText={
                            usernameError ||
                            "Username must be between 3 and 30 characters."
                        }
                    />


                    {usernameSuccess && (

                        <Alert
                            severity="success"
                            sx={{
                                mt: 2,
                            }}
                        >

                            {usernameSuccess}

                        </Alert>

                    )}

                </DialogContent>


                <DialogActions
                    sx={{
                        px: 3,
                        pb: 2,
                    }}
                >

                    <Button
                        onClick={
                            closeUsernameDialog
                        }
                        disabled={
                            usernameLoading
                        }
                    >

                        Cancel

                    </Button>


                    <Button
                        variant="contained"
                        onClick={
                            handleUsernameUpdate
                        }
                        disabled={
                            usernameLoading
                        }
                    >

                        {usernameLoading ? (

                            <CircularProgress
                                size={22}
                                color="inherit"
                            />

                        ) : (

                            "Save"

                        )}

                    </Button>

                </DialogActions>

            </Dialog>


            {/* PASSWORD DIALOG */}

            <Dialog
                open={
                    passwordDialogOpen
                }
                onClose={
                    closePasswordDialog
                }
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle>

                    Change Password

                </DialogTitle>


                <DialogContent>

                    <Stack
                        spacing={2}
                        mt={1}
                    >

                        <TextField
                            fullWidth
                            type="password"
                            label="Current Password"
                            value={
                                currentPassword
                            }
                            onChange={(event) =>
                                setCurrentPassword(
                                    event.target.value
                                )
                            }
                            disabled={
                                passwordLoading
                            }
                        />


                        <TextField
                            fullWidth
                            type="password"
                            label="New Password"
                            value={
                                newPassword
                            }
                            onChange={(event) =>
                                setNewPassword(
                                    event.target.value
                                )
                            }
                            disabled={
                                passwordLoading
                            }
                            helperText="Password must be at least 6 characters."
                        />


                        <TextField
                            fullWidth
                            type="password"
                            label="Confirm New Password"
                            value={
                                confirmPassword
                            }
                            onChange={(event) =>
                                setConfirmPassword(
                                    event.target.value
                                )
                            }
                            disabled={
                                passwordLoading
                            }
                        />


                        {passwordError && (

                            <Alert
                                severity="error"
                            >

                                {passwordError}

                            </Alert>

                        )}


                        {passwordSuccess && (

                            <Alert
                                severity="success"
                            >

                                {passwordSuccess}

                            </Alert>

                        )}

                    </Stack>

                </DialogContent>


                <DialogActions
                    sx={{
                        px: 3,
                        pb: 2,
                    }}
                >

                    <Button
                        onClick={
                            closePasswordDialog
                        }
                        disabled={
                            passwordLoading
                        }
                    >

                        Cancel

                    </Button>


                    <Button
                        variant="contained"
                        onClick={
                            handlePasswordChange
                        }
                        disabled={
                            passwordLoading
                        }
                    >

                        {passwordLoading ? (

                            <CircularProgress
                                size={22}
                                color="inherit"
                            />

                        ) : (

                            "Change Password"

                        )}

                    </Button>

                </DialogActions>

            </Dialog>


            {/* VIEW SHOWS DIALOG */}

            <Dialog
                open={viewShowsDialogOpen}
                onClose={closeViewShowsDialog}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>
                    Shows{viewShowsMovie ? ` — ${viewShowsMovie.title}` : ""}
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <Typography variant="body2" color="text.secondary">
                            Shows currently associated with this movie.
                        </Typography>

                        {movieShowsError && (
                            <Alert severity="error">{movieShowsError}</Alert>
                        )}

                        {movieShowsLoading ? (
                            <Box display="flex" justifyContent="center" py={4}>
                                <CircularProgress />
                            </Box>
                        ) : movieShowsError ? null : movieShows.length === 0 ? (
                            <Alert severity="info">
                                No shows have been created for this movie yet.
                            </Alert>
                        ) : (
                            <Stack spacing={1.5}>
                                {movieShows.map((show) => (
                                    <Card key={show._id} variant="outlined">
                                        <CardContent>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {show.theatre}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                City: {show.city} · Screen: {show.screen}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Date: {show.show_date} · Time: {show.show_time}
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium" sx={{ mt: 0.5 }}>
                                                Ticket price: ₹{show.price}
                                            </Typography>
                                            {((show as Show & { status?: string }).status === "cancelled") && (
                                                <Alert severity="warning" sx={{ mt: 1.5 }}>
                                                    This show is cancelled. It is retained in the database for history.
                                                </Alert>
                                            )}
                                            <Box sx={{ mt: 1.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<EditIcon />}
                                                    disabled={((show as Show & { status?: string }).status === "cancelled")}
                                                    onClick={() => openEditShowDialog(show)}
                                                >
                                                    Edit Show
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<EventBusyIcon />}
                                                    disabled={((show as Show & { status?: string }).status === "cancelled")}
                                                    onClick={() => openCancelShowDialog(show)}
                                                >
                                                    Cancel Show
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={closeViewShowsDialog}>Close</Button>
                </DialogActions>
            </Dialog>


            {/* CANCEL SHOW CONFIRMATION DIALOG */}

            <Dialog
                open={cancelShowDialogOpen}
                onClose={closeCancelShowDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Cancel Show</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <Alert severity="warning">
                            This will mark the show as cancelled without deleting its show, seat, or booking records.
                            In this version, cancellation is blocked when confirmed bookings or booked/held seats exist.
                        </Alert>
                        {showToCancel && (
                            <Typography>
                                Cancel {showToCancel.theatre} — {showToCancel.show_date} at {showToCancel.show_time}?
                            </Typography>
                        )}
                        {cancelShowError && <Alert severity="error">{cancelShowError}</Alert>}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={closeCancelShowDialog} disabled={cancelShowLoading}>
                        Keep Show
                    </Button>
                    <Button
                        onClick={() => void handleCancelShow()}
                        color="error"
                        variant="contained"
                        disabled={cancelShowLoading || !showToCancel}
                        startIcon={cancelShowLoading ? <CircularProgress size={16} /> : <EventBusyIcon />}
                    >
                        {cancelShowLoading ? "Cancelling..." : "Confirm Cancellation"}
                    </Button>
                </DialogActions>
            </Dialog>


            {/* EDIT SHOW DIALOG */}

            <Dialog
                open={editShowDialogOpen}
                onClose={closeEditShowDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Edit Show{viewShowsMovie ? ` — ${viewShowsMovie.title}` : ""}
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <Alert severity="info">
                            Shows with confirmed bookings or booked/held seats cannot be edited.
                        </Alert>

                        <TextField
                            fullWidth
                            label="Theatre"
                            value={editShowTheatre}
                            onChange={(event) => setEditShowTheatre(event.target.value)}
                            disabled={editShowLoading}
                            required
                        />
                        <TextField
                            fullWidth
                            label="City"
                            value={editShowCity}
                            onChange={(event) => setEditShowCity(event.target.value)}
                            disabled={editShowLoading}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Screen"
                            value={editShowScreen}
                            onChange={(event) => setEditShowScreen(event.target.value)}
                            disabled={editShowLoading}
                            required
                        />
                        <TextField
                            fullWidth
                            type="date"
                            label="Show Date"
                            value={editShowDate}
                            onChange={(event) => setEditShowDate(event.target.value)}
                            disabled={editShowLoading}
                            required
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: new Date().toISOString().slice(0, 10) }}
                        />
                        <TextField
                            fullWidth
                            type="time"
                            label="Show Time"
                            value={editShowTime}
                            onChange={(event) => setEditShowTime(event.target.value)}
                            disabled={editShowLoading}
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth
                            type="number"
                            label="Ticket Price (₹)"
                            value={editShowPrice}
                            onChange={(event) => setEditShowPrice(event.target.value)}
                            disabled={editShowLoading}
                            required
                            inputProps={{ min: 1, step: 1 }}
                        />

                        {editShowError && <Alert severity="error">{editShowError}</Alert>}
                        {editShowSuccess && <Alert severity="success">{editShowSuccess}</Alert>}
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={closeEditShowDialog} disabled={editShowLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => void handleUpdateShow()}
                        disabled={editShowLoading || Boolean(editShowSuccess)}
                    >
                        {editShowLoading ? (
                            <CircularProgress size={22} color="inherit" />
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>


            {/* =================================================
                ADD SHOW DIALOG
            ================================================= */}

            <Dialog
                open={addShowDialogOpen}
                onClose={closeAddShowDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Add Show{selectedShowMovie ? ` — ${selectedShowMovie.title}` : ""}
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <Typography variant="body2" color="text.secondary">
                            Create a show for this movie. The movie is selected from your own movie list.
                        </Typography>

                        <TextField
                            fullWidth
                            label="Theatre"
                            value={showTheatre}
                            onChange={(event) => setShowTheatre(event.target.value)}
                            disabled={createShowLoading}
                            required
                        />

                        <TextField
                            fullWidth
                            label="City"
                            value={showCity}
                            onChange={(event) => setShowCity(event.target.value)}
                            disabled={createShowLoading}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Screen"
                            value={showScreen}
                            onChange={(event) => setShowScreen(event.target.value)}
                            disabled={createShowLoading}
                            required
                        />

                        <TextField
                            fullWidth
                            type="date"
                            label="Show Date"
                            value={showDate}
                            onChange={(event) => setShowDate(event.target.value)}
                            disabled={createShowLoading}
                            required
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: new Date().toISOString().slice(0, 10) }}
                        />

                        <TextField
                            fullWidth
                            type="time"
                            label="Show Time"
                            value={showTime}
                            onChange={(event) => setShowTime(event.target.value)}
                            disabled={createShowLoading}
                            required
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            fullWidth
                            type="number"
                            label="Ticket Price (₹)"
                            value={showPrice}
                            onChange={(event) => setShowPrice(event.target.value)}
                            disabled={createShowLoading}
                            required
                            inputProps={{ min: 1, step: 1 }}
                        />

                        {createShowError && (
                            <Alert severity="error">
                                {createShowError}
                            </Alert>
                        )}

                        {createShowSuccess && (
                            <Alert severity="success">
                                {createShowSuccess}
                            </Alert>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={closeAddShowDialog}
                        disabled={createShowLoading}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleCreateShow}
                        disabled={createShowLoading || Boolean(createShowSuccess)}
                    >
                        {createShowLoading ? (
                            <CircularProgress size={22} color="inherit" />
                        ) : (
                            "Create Show"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>


            {/* =================================================
                EDIT MOVIE DIALOG
            ================================================= */}

            <Dialog
                open={
                    editMovieDialogOpen
                }
                onClose={
                    closeEditMovieDialog
                }
                fullWidth
                maxWidth="md"
            >

                <DialogTitle>

                    Edit Movie

                </DialogTitle>


                <DialogContent>

                    <Stack
                        spacing={2}
                        mt={1}
                    >

                        <TextField
                            fullWidth
                            label="Movie Title"
                            value={
                                editTitle
                            }
                            onChange={(event) =>
                                setEditTitle(
                                    event.target.value
                                )
                            }
                            disabled={
                                editMovieLoading
                            }
                        />


                        <TextField
                            fullWidth
                            multiline
                            minRows={4}
                            label="Description"
                            value={
                                editDescription
                            }
                            onChange={(event) =>
                                setEditDescription(
                                    event.target.value
                                )
                            }
                            disabled={
                                editMovieLoading
                            }
                        />


                        <TextField
                            fullWidth
                            label="Genre"
                            value={
                                editGenre
                            }
                            onChange={(event) =>
                                setEditGenre(
                                    event.target.value
                                )
                            }
                            disabled={
                                editMovieLoading
                            }
                        />


                        <TextField
                            fullWidth
                            label="Language"
                            value={
                                editLanguage
                            }
                            onChange={(event) =>
                                setEditLanguage(
                                    event.target.value
                                )
                            }
                            disabled={
                                editMovieLoading
                            }
                        />


                        <TextField
                            fullWidth
                            type="number"
                            label="Duration (minutes)"
                            value={
                                editDuration
                            }
                            onChange={(event) =>
                                setEditDuration(
                                    event.target.value
                                )
                            }
                            disabled={
                                editMovieLoading
                            }
                            inputProps={{
                                min: 1,
                            }}
                        />


                        {/* Poster */}

                        <Box>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mb={1}
                            >

                                Movie Poster

                            </Typography>


                            <Button
                                variant="outlined"
                                component="label"
                                disabled={
                                    editMovieLoading
                                }
                            >
                                Choose New Poster
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={
                                        handlePosterChange
                                    }
                                />

                            </Button>

                            {editPoster && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        mt: 1,
                                    }}
                                >
                                    Selected:{" "}
                                    {
                                        editPoster.name
                                    }
                                </Typography>
                            )}

                            <Typography
                                variant="caption"
                                display="block"
                                color="text.secondary"
                                mt={1}
                            >

                                Leave this unchanged if
                                you do not want to replace
                                the existing poster.
                            </Typography>
                        </Box>

                        {editMovieError && (
                            <Alert
                                severity="error"
                            >
                                {editMovieError}
                            </Alert>
                        )}

                        {editMovieSuccess && (
                            <Alert
                                severity="success"
                            >
                                {editMovieSuccess}
                            </Alert>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 2,
                    }}
                >
                    <Button
                        onClick={closeEditMovieDialog}
                        disabled={editMovieLoading}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleMovieUpdate}
                        disabled={editMovieLoading}
                    >
                        {editMovieLoading ? (
                            <CircularProgress
                                size={22}
                                color="inherit"
                            />

                        ) : (
                            "Save Changes"
                        )}

                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
