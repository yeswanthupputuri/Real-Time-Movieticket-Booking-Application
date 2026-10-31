import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Chip,
    Divider,
    Stack,
    Typography,
} from "@mui/material";

import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

import {
    getShowsByMovie,
} from "../../services/showService";

import type {
    Show,
} from "../../types/show";

export default function ShowSelection() {

    const { movieId } = useParams();
    const navigate = useNavigate();
    const [shows, setShows] =
        useState<Show[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    // Load Shows

    useEffect(() => {
        async function loadShows() {
            if (!movieId) {
                setError( "Movie ID is missing." );
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError("");
                const data =
                    await getShowsByMovie(movieId);
                setShows(data);
            } catch (error) {
                console.error(
                    "Shows loading failed:",
                    error
                );
                setError(
                    "Unable to load available shows."
                );
            } finally {
                setLoading(false);
            }
        }
        loadShows();
    }, [movieId]);

    // Loading

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "60vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    // Error
    if (error) {
        return (
            <Box
                sx={{
                    maxWidth: 1000,
                    mx: "auto",
                    px: 3,
                    py: 5,
                    textAlign: "center",
                }}
            >
                <Typography
                    variant="h6"
                    color="error"
                    mb={3}
                >
                    {error}
                </Typography>

                <Button
                    variant="contained"
                    onClick={() =>
                        navigate(
                            movieId
                                ? `/movie/${movieId}`
                                : "/home"
                        )
                    }
                >
                    Back to Movie
                </Button>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                maxWidth: 1100,
                mx: "auto",
                px: {
                    xs: 2,
                    sm: 3,
                    md: 4,
                },
                py: {
                    xs: 2,
                    md: 4,
                },
            }}
        >

            {/* =================================================
                BACK BUTTON
            ================================================= */}
            <Button
                startIcon={
                    <ArrowBackIcon />
                }
                onClick={() =>
                    navigate(
                        movieId
                            ? `/movie/${movieId}`
                            : "/home"
                    )
                }
                sx={{
                    mb: 3,
                }}
            >
                Back to Movie
            </Button>


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <Typography
                variant="h3"
                fontWeight="bold"
                sx={{
                    fontSize: {
                        xs: "2rem",
                        sm: "2.5rem",
                        md: "3rem",
                    },
                }}
            >
                Select a Show
            </Typography>

            <Typography
                color="text.secondary"
                mt={1}
                mb={4}
            >
                Choose your preferred theatre and showtime.
            </Typography>

            {/* NO SHOWS */}

            {shows.length === 0 && (

                <Card
                    elevation={2}
                    sx={{
                        borderRadius: 3,
                        textAlign: "center",
                        py: 6,
                        px: 3,
                    }}
                >

                    <Typography
                        variant="h5"
                        fontWeight="bold"
                    >
                        No Shows Available
                    </Typography>

                    <Typography
                        color="text.secondary"
                        mt={1}
                    >
                        There are currently no shows available
                        for this movie.
                    </Typography>

                    <Button
                        variant="contained"
                        sx={{
                            mt: 3,
                        }}
                        onClick={() =>
                            navigate(
                                movieId
                                    ? `/movie/${movieId}`
                                    : "/home"
                            )
                        }
                    >
                        Back to Movie
                    </Button>

                </Card>

            )}


            {/* SHOW LIST*/}

            <Stack spacing={3}>

                {shows.map((show) => (

                    <Card
                        key={show._id}
                        elevation={3}
                        sx={{
                            borderRadius: 3,
                            overflow: "hidden",
                            transition: "0.2s",

                            "&:hover": {
                                boxShadow: 7,
                                transform:
                                    "translateY(-2px)",
                            },
                        }}
                    >

                        <CardContent
                            sx={{
                                p: {
                                    xs: 2.5,
                                    sm: 3,
                                    md: 4,
                                },

                                "&:last-child": {
                                    pb: {
                                        xs: 2.5,
                                        sm: 3,
                                        md: 4,
                                    },
                                },
                            }}
                        >

                            {/* THEATRE*/}

                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems={{
                                    xs: "flex-start",
                                    sm: "center",
                                }}
                                flexDirection={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                gap={1}
                            >

                                <Box>

                                    <Typography
                                        variant="h5"
                                        fontWeight="bold"
                                    >
                                        {show.theatre}
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                        mt={0.5}
                                    >
                                        {show.city}
                                    </Typography>

                                </Box>

                                <Chip
                                    label="Available"
                                    color="success"
                                    size="small"
                                />

                            </Box>


                            <Divider
                                sx={{
                                    my: 2.5,
                                }}
                            />


                            {/* SHOW INFORMATION */}

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "1fr",
                                        sm: "repeat(2, 1fr)",
                                        md: "repeat(4, 1fr)",
                                    },
                                    gap: 2,
                                }}
                            >

                                {/* Date */}

                                <Box>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        mb={0.5}
                                    >
                                        Date
                                    </Typography>

                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                    >

                                        <EventIcon
                                            fontSize="small"
                                        />

                                        <Typography
                                            fontWeight="bold"
                                        >
                                            {show.show_date}
                                        </Typography>

                                    </Stack>

                                </Box>


                                {/* Time */}

                                <Box>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        mb={0.5}
                                    >
                                        Show Time
                                    </Typography>

                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                    >

                                        <AccessTimeIcon
                                            fontSize="small"
                                        />

                                        <Typography
                                            fontWeight="bold"
                                        >
                                            {show.show_time}
                                        </Typography>

                                    </Stack>

                                </Box>


                                {/* Screen */}

                                <Box>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        mb={0.5}
                                    >
                                        Screen
                                    </Typography>

                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                    >

                                        <MeetingRoomIcon
                                            fontSize="small"
                                        />

                                        <Typography
                                            fontWeight="bold"
                                        >
                                            {show.screen}
                                        </Typography>

                                    </Stack>

                                </Box>


                                {/* City */}

                                <Box>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        mb={0.5}
                                    >
                                        Location
                                    </Typography>

                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                    >

                                        <LocationCityIcon
                                            fontSize="small"
                                        />

                                        <Typography
                                            fontWeight="bold"
                                        >
                                            {show.city}
                                        </Typography>

                                    </Stack>

                                </Box>

                            </Box>


                            <Divider
                                sx={{
                                    my: 2.5,
                                }}
                            />


                            {/*  PRICE + SELECT SEATS */}

                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                flexDirection={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                gap={2}
                            >

                                <Box>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Ticket Price
                                    </Typography>

                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={0.3}
                                    >

                                        <CurrencyRupeeIcon
                                            sx={{
                                                fontSize:
                                                    "1.3rem",
                                            }}
                                        />

                                        <Typography
                                            variant="h5"
                                            fontWeight="bold"
                                        >
                                            {show.price}
                                        </Typography>

                                    </Stack>

                                </Box>


                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth={
                                        false
                                    }
                                    sx={{
                                        minWidth: {
                                            xs: "100%",
                                            sm: 180,
                                        },
                                        py: 1.3,
                                        borderRadius: 2,
                                    }}
                                    onClick={() =>
                                        navigate(
                                            `/seat-selection/${show._id}`,
                                            {
                                                state: {
                                                    movieId:
                                                        show.movie_id ??
                                                        movieId,
                                                },
                                            }
                                        )
                                    }
                                >
                                    Select Seats
                                </Button>

                            </Box>

                        </CardContent>

                    </Card>

                ))}

            </Stack>

        </Box>

    );
}