import {
    Box,
    Button,
    Card,
    CardMedia,
    Typography,
    CircularProgress,
    Paper,
    Stack,
    Divider,
    Chip,
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
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

import {
    getMovie,
} from "../../services/movieService";

import {
    getShowsByMovie,
} from "../../services/showService";

import type {
    Movie,
} from "../../types/movie";

import type {
    Show,
} from "../../types/show";

export default function MovieDetails() {

    const { movieId } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [shows, setShows] = useState<Show[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Load Movie + Shows

    useEffect(() => {
        async function loadData() {
            if (!movieId) {
                setError(
                    "Movie ID is missing."
                );
                setLoading(false);
                return;

            }
            try {
                setLoading(true);
                setError("");
                const movieData = await getMovie(movieId);
                const showData = await getShowsByMovie(movieId);
                setMovie(movieData);
                setShows(showData);

            } catch (error) {
                console.error(
                    "Movie details loading failed:",
                    error
                );

                setError(
                    "Unable to load movie details."
                );

            } finally {
                setLoading(false);
            }
        }

        loadData();
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
                    textAlign: "center",
                    mt: 8,
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
                        navigate("/home")
                    }
                >
                    Back to Movies
                </Button>

            </Box>

        );

    }

    // Movie Not Found
  
    if (!movie) {

        return (

            <Box
                sx={{
                    textAlign: "center",
                    mt: 8,
                }}
            >

                <Typography
                    variant="h5"
                    mb={3}
                >
                    Movie not found.
                </Typography>

                <Button
                    variant="contained"
                    onClick={() =>
                        navigate("/home")
                    }
                >
                    Back to Movies
                </Button>

            </Box>

        );

    }

    // Movie Details
    return (

        <Box
            sx={{
                maxWidth: 1200,
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

            {/* BACK BUTTON*/}

            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() =>
                    navigate("/home")
                }
                sx={{
                    mb: 3,
                }}
            >
                Back to Movies
            </Button>


            {/* MOVIE INFORMATION */}

            <Card
                elevation={4}
                sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                }}
            >

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: {
                            xs: "column",
                            md: "row",
                        },
                    }}
                >

                    {/* POSTER*/}

                    <Box
                        sx={{
                            width: {
                                xs: "100%",
                                md: 350,
                            },
                            flexShrink: 0,
                        }}
                    >

                        <CardMedia
                            component="img"
                            image={`http://127.0.0.1:8000/${movie.poster}`}
                            alt={movie.title}
                            sx={{
                                width: "100%",
                                height: {
                                    xs: 420,
                                    sm: 500,
                                    md: 520,
                                },
                                objectFit: "cover",
                            }}
                        />

                    </Box>


                    {/* MOVIE CONTENT*/}

                    <Box
                        sx={{
                            flex: 1,
                            p: {
                                xs: 3,
                                sm: 4,
                                md: 5,
                            },
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >

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
                            {movie.title}
                        </Typography>


                        {/* MOVIE TAGS */}

                        <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            useFlexGap
                            mt={2}
                        >

                            <Chip
                                label={movie.genre}
                                color="primary"
                            />

                            <Chip
                                label={movie.language}
                                variant="outlined"
                            />

                            <Chip
                                label={`${movie.duration} min`}
                                variant="outlined"
                            />

                        </Stack>


                        <Divider
                            sx={{
                                my: 3,
                            }}
                        />


                        {/* DESCRIPTION */}

                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            mb={1}
                        >
                            About the Movie
                        </Typography>

                        <Typography
                            color="text.secondary"
                            lineHeight={1.8}
                        >
                            {movie.description}
                        </Typography>


                        {/* QUICK INFORMATION*/}

                        <Box
                            sx={{
                                mt: 4,
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    sm: "repeat(3, 1fr)",
                                },
                                gap: 2,
                            }}
                        >

                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    textAlign: "center",
                                }}
                            >

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Genre
                                </Typography>

                                <Typography
                                    fontWeight="bold"
                                    mt={0.5}
                                >
                                    {movie.genre}
                                </Typography>

                            </Paper>


                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    textAlign: "center",
                                }}
                            >

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Language
                                </Typography>

                                <Typography
                                    fontWeight="bold"
                                    mt={0.5}
                                >
                                    {movie.language}
                                </Typography>

                            </Paper>


                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    textAlign: "center",
                                }}
                            >

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Duration
                                </Typography>

                                <Typography
                                    fontWeight="bold"
                                    mt={0.5}
                                >
                                    {movie.duration} min
                                </Typography>

                            </Paper>

                        </Box>

                    </Box>

                </Box>

            </Card>


            {/* AVAILABLE SHOWS*/}

            <Box mt={6}>

                <Typography
                    variant="h4"
                    fontWeight="bold"
                    mb={1}
                    sx={{
                        fontSize: {
                            xs: "1.8rem",
                            sm: "2.2rem",
                            md: "2.5rem",
                        },
                    }}
                >
                    Available Shows
                </Typography>

                <Typography
                    color="text.secondary"
                    mb={3}
                >
                    Select a theatre and showtime to book your
                    tickets.
                </Typography>


                {/* NO SHOWS*/}

                {shows.length === 0 && (

                    <Paper
                        elevation={1}
                        sx={{
                            p: 5,
                            textAlign: "center",
                            borderRadius: 3,
                        }}
                    >

                        <Typography
                            variant="h6"
                            mb={1}
                        >
                            No shows available
                        </Typography>

                        <Typography
                            color="text.secondary"
                        >
                            There are currently no shows
                            scheduled for this movie.
                        </Typography>

                    </Paper>

                )}


                {/* SHOW CARDS */}

                <Stack spacing={2}>

                    {shows.map((show) => (

                        <Paper
                            key={show._id}
                            elevation={3}
                            sx={{
                                p: {
                                    xs: 2,
                                    sm: 3,
                                },
                                borderRadius: 3,
                                transition:
                                    "0.2s",
                                "&:hover": {
                                    boxShadow: 6,
                                },
                            }}
                        >

                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: {
                                        xs: "column",
                                        md: "row",
                                    },
                                    justifyContent:
                                        "space-between",
                                    alignItems: {
                                        xs: "stretch",
                                        md: "center",
                                    },
                                    gap: 3,
                                }}
                            >

                                {/* SHOW INFORMATION */}

                                <Box
                                    sx={{
                                        flex: 1,
                                    }}
                                >

                                    <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                        mb={1.5}
                                    >
                                        {show.theatre}
                                    </Typography>


                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        flexWrap="wrap"
                                        useFlexGap
                                    >

                                        <Chip
                                            icon={
                                                <LocationCityIcon />
                                            }
                                            label={
                                                show.city
                                            }
                                            size="small"
                                            variant="outlined"
                                        />

                                        <Chip
                                            icon={
                                                <MeetingRoomIcon />
                                            }
                                            label={
                                                `Screen ${show.screen}`
                                            }
                                            size="small"
                                            variant="outlined"
                                        />

                                        <Chip
                                            icon={
                                                <EventIcon />
                                            }
                                            label={
                                                show.show_date
                                            }
                                            size="small"
                                            variant="outlined"
                                        />

                                        <Chip
                                            icon={
                                                <AccessTimeIcon />
                                            }
                                            label={
                                                show.show_time
                                            }
                                            size="small"
                                            variant="outlined"
                                        />

                                    </Stack>

                                </Box>


                                {/* PRICE + BOOK BUTTON*/}

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: {
                                            xs: "center",
                                            md: "flex-end",
                                        },
                                        justifyContent: {
                                            xs: "space-between",
                                            md: "flex-end",
                                        },
                                        gap: 3,
                                        minWidth: {
                                            md: 180,
                                        },
                                    }}
                                >

                                    <Box>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Ticket Price
                                        </Typography>

                                        <Typography
                                            variant="h5"
                                            fontWeight="bold"
                                        >
                                            <CurrencyRupeeIcon
                                                sx={{
                                                    fontSize:
                                                        "1rem",
                                                    verticalAlign:
                                                        "middle",
                                                }}
                                            />
                                            {show.price}
                                        </Typography>

                                    </Box>


                                    <Button
                                        variant="contained"
                                        size="large"
                                        sx={{
                                            px: 3,
                                            py: 1.2,
                                            borderRadius: 2,
                                            whiteSpace:
                                                "nowrap",
                                        }}
                                        onClick={() =>
                                            navigate(
                                                `/seat-selection/${show._id}`,
                                                {
                                                    state: {
                                                        movieId,
                                                    },
                                                }
                                            )
                                        }
                                    >
                                        Book Now
                                    </Button>

                                </Box>

                            </Box>

                        </Paper>

                    ))}

                </Stack>

            </Box>

        </Box>

    );
}