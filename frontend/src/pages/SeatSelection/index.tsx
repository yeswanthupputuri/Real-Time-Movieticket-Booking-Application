import {
    Box,
    Button,
    CircularProgress,
    Divider,
    Paper,
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
import EventSeatIcon from "@mui/icons-material/EventSeat";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";

import Seat from "../../components/Seat";

import {
    getSeats,
    holdSeats,
} from "../../services/seatService";

import {
    getShow,
} from "../../services/showService";

import type {
    Seat as SeatType,
} from "../../types/seat";

export default function SeatSelection() {

    const { showId } = useParams();

    const navigate = useNavigate();

    // Movie / Show

    const [movieId, setMovieId] =
        useState<string | null>(null);

    const [theatre, setTheatre] =
        useState("");

    const [showDate, setShowDate] =
        useState("");

    const [showTime, setShowTime] =
        useState("");

    // Seats

    const [seats, setSeats] =
        useState<SeatType[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [selectedSeats, setSelectedSeats] =
        useState<string[]>([]);

    const [bookingLoading, setBookingLoading] =
        useState(false);

    // Price

    const [price, setPrice] =
        useState<number>(0);

    // Load Show + Seats

    useEffect(() => {

        async function loadData() {

            if (!showId) {

                console.error(
                    "Show ID is missing"
                );

                setLoading(false);

                return;

            }

            try {

                setLoading(true);

                // Get Show Details

                const show =
                    await getShow(showId);

                console.log(
                    "Show API response:",
                    show
                );

                if (!show.movie_id) {

                    console.error(
                        "movie_id is missing:",
                        show
                    );

                    alert(
                        "Movie information is missing from this show."
                    );

                    return;

                }

                setMovieId(
                    show.movie_id
                );

                setPrice(
                    Number(show.price)
                );

                setTheatre(
                    show.theatre
                );

                setShowDate(
                    show.show_date
                );

                setShowTime(
                    show.show_time
                );

                // Get Seats

                const seatData =
                    await getSeats(showId);

                console.log(
                    "Seats API response:",
                    seatData
                );

                setSeats(seatData);

            } catch (error) {

                console.error(
                    "Failed to load show/seats:",
                    error
                );

                alert(
                    "Failed to load show details."
                );

            } finally {

                setLoading(false);

            }

        }

        loadData();

    }, [showId]);

    // Toggle Seat

    function toggleSeat(
        seatNumber: string
    ) {

        const seat =
            seats.find(
                (item) =>
                    item.seat_number === seatNumber
            );

        // Only available seats can be selected
        if (
            !seat ||
            seat.status !== "available"
        ) {
            return;
        }

        if (
            selectedSeats.includes(
                seatNumber
            )
        ) {

            setSelectedSeats(

                selectedSeats.filter(
                    (seat) =>
                        seat !== seatNumber
                )

            );

        } else {

            setSelectedSeats([

                ...selectedSeats,
                seatNumber,

            ]);

        }

    }

    // Continue to Checkout

    async function handleContinue() {

        if (!showId) {

            alert(
                "Show ID is missing."
            );

            return;

        }

        if (!movieId) {

            alert(
                "Movie ID is missing."
            );

            return;

        }

        if (
            selectedSeats.length === 0
        ) {

            alert(
                "Please select at least one seat."
            );

            return;

        }

        try {

            setBookingLoading(true);

            console.log(
                "Holding seats:",
                {
                    showId,
                    selectedSeats,
                }
            );

            // Hold Seats

            await holdSeats(
                showId,
                selectedSeats
            );

            // Calculate Total

            const total =
                selectedSeats.length *
                price;

            // Navigate to Checkout

            navigate(
                "/checkout",
                {
                    state: {

                        showId,

                        movieId,

                        seats: selectedSeats,

                        total,

                    },
                }
            );

        } catch (error: any) {

            console.error(
                "Failed to hold seats:",
                error
            );

            alert(
                error.response?.data?.message ??
                "Unable to hold seats"
            );

            try {

                const latest =
                    await getSeats(showId);

                setSeats(latest);

            } catch (refreshError) {

                console.error(
                    "Failed to refresh seats:",
                    refreshError
                );

            }

            setSelectedSeats([]);

        } finally {

            setBookingLoading(false);

        }

    }

    // Group Seats By Row

    const seatRows: Record<
        string,
        SeatType[]
    > = {};

    seats.forEach((seat) => {

        const row =
            seat.seat_number.charAt(0);

        if (!seatRows[row]) {
            seatRows[row] = [];
        }

        seatRows[row].push(seat);

    });

    const rows =
        Object.keys(seatRows).sort();

    // Seat Statistics

    const availableSeats =
        seats.filter(
            (seat) =>
                seat.status === "available"
        ).length;

    const bookedSeats =
        seats.filter(
            (seat) =>
                seat.status === "booked"
        ).length;

    const heldSeats =
        seats.filter(
            (seat) =>
                seat.status === "held"
        ).length;

    const total =
        selectedSeats.length *
        price;

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

    // UI

    return (

        <Box
            sx={{
                width: "100%",
                maxWidth: 1100,
                mx: "auto",
                px: {
                    xs: 1,
                    sm: 2,
                    md: 3,
                },
                py: {
                    xs: 2,
                    md: 4,
                },
                boxSizing: "border-box",
                overflowX: "hidden",
            }}
        >

            {/* BACK */}

            <Button
                startIcon={
                    <ArrowBackIcon />
                }
                onClick={() =>
                    navigate(
                        movieId
                            ? `/show/${movieId}`
                            : "/home"
                    )
                }
                sx={{
                    mb: 2,
                }}
            >
                Back to Shows
            </Button>


            {/* HEADER */}

            <Box
                mb={4}
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
                    Select Your Seats
                </Typography>

                <Typography
                    color="text.secondary"
                    mt={1}
                >
                    Choose your preferred seats for the show.
                </Typography>

            </Box>


            {/* SHOW SUMMARY */}

            <Paper
                elevation={2}
                sx={{
                    p: {
                        xs: 2,
                        sm: 3,
                    },
                    mb: 4,
                    borderRadius: 3,
                }}
            >

                <Stack
                    direction={{
                        xs: "column",
                        sm: "row",
                    }}
                    spacing={{
                        xs: 1,
                        sm: 4,
                    }}
                    divider={
                        <Divider
                            orientation="vertical"
                            flexItem
                        />
                    }
                >

                    <Box>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Theatre
                        </Typography>

                        <Typography
                            fontWeight="bold"
                        >
                            {theatre || "Cinema"}
                        </Typography>

                    </Box>

                    <Box>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Date
                        </Typography>

                        <Typography
                            fontWeight="bold"
                        >
                            {showDate}
                        </Typography>

                    </Box>

                    <Box>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Time
                        </Typography>

                        <Typography
                            fontWeight="bold"
                        >
                            {showTime}
                        </Typography>

                    </Box>

                </Stack>

            </Paper>


            {/*  SCREEN */}

            <Paper
                elevation={2}
                sx={{
                    p: {
                        xs: 2,
                        sm: 3,
                    },
                    borderRadius: 4,
                    mb: 4,
                    overflowX: "auto",
                }}
            >

                <Box
                    sx={{
                        minWidth: {
                            xs: 350,
                            sm: 500,
                        },
                    }}
                >

                    {/* Screen */}

                    <Box
                        sx={{
                            width: {
                                xs: "85%",
                                sm: "70%",
                                md: "60%",
                            },
                            mx: "auto",
                            mb: { xs: 4, sm: 5, },
                            textAlign: "center",
                        }}
                    >

                        <Box
                            sx={{
                                height: {xs: 6, sm: 8, },
                                borderRadius:
                                    "50%",
                                background:
                                    "linear-gradient(to right, transparent, rgba(25,118,210,0.8), transparent)",
                                boxShadow: "0 3px 12px rgba(25,118,210,0.25)",
                                mb: 1,
                            }}
                        />

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            fontWeight="bold"
                            letterSpacing={2}
                        >
                            SCREEN
                        </Typography>

                    </Box>


                    {/* SEAT GRID */}

                    {rows.length === 0 ? (

                        <Box
                            textAlign="center"
                            py={5}
                        >

                            <Typography
                                variant="h6"
                            >
                                No seats available
                            </Typography>

                        </Box>

                    ) : (

                        <Stack
                            spacing={{ xs: 1, sm: 1.5 }}
                            alignItems="center"
                        >

                            {rows.map((row) => (

                                <Box
                                    key={row}
                                    sx={{
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        gap: {
                                            xs: 0.75,
                                            sm: 1,
                                        },
                                    }}
                                >

                                    {/* Row Label */}

                                    <Typography
                                        sx={{
                                            width: {
                                                xs: 22,
                                                sm: 28,
                                            },
                                            fontWeight:
                                                "bold",
                                            color:
                                                "text.secondary",
                                            textAlign:
                                                "center",
                                        }}
                                    >
                                        {row}
                                    </Typography>


                                    {/* Seats */}

                                    <Box
                                        sx={{
                                            display:
                                                "flex",
                                            gap: {
                                                xs: 0.6,
                                                sm: 1,
                                            },
                                        }}
                                    >

                                        {seatRows[row]
                                            .sort(
                                                (
                                                    a,
                                                    b
                                                ) =>
                                                    Number(
                                                        a.seat_number.substring(
                                                            1
                                                        )
                                                    ) -
                                                    Number(
                                                        b.seat_number.substring(
                                                            1
                                                        )
                                                    )
                                            )
                                            .map(
                                                (
                                                    seat
                                                ) => (

                                                    <Seat
                                                        key={
                                                            seat._id
                                                        }
                                                        seatNumber={
                                                            seat.seat_number
                                                        }
                                                        status={
                                                            seat.status
                                                        }
                                                        selected={
                                                            selectedSeats.includes(
                                                                seat.seat_number
                                                            )
                                                        }
                                                        onClick={() =>
                                                            toggleSeat(
                                                                seat.seat_number
                                                            )
                                                        }
                                                    />
                                                )
                                            )}

                                    </Box>

                                </Box>

                            ))}

                        </Stack>

                    )}

                </Box>

            </Paper>


            {/* LEGEND */}

            <Paper
                elevation={1}
                sx={{
                    p: 2,
                    mb: 4,
                    borderRadius: 3,
                }}
            >

                <Typography
                    fontWeight="bold"
                    mb={2}
                    textAlign="center"
                >
                    Seat Status
                </Typography>

                <Box
                    display="flex"
                    justifyContent="center"
                    flexWrap="wrap"
                    gap={{
                        xs: 2,
                        sm: 4,
                    }}
                >

                    <LegendItem
                        color="#43a047"
                        label="Available"
                    />

                    <LegendItem
                        color="#1976d2"
                        label="Selected"
                    />

                    <LegendItem
                        color="#fb8c00"
                        label="Held"
                    />

                    <LegendItem
                        color="#e53935"
                        label="Booked"
                    />

                </Box>

            </Paper>


            {/* SEAT STATISTICS */}

            <Box
                display="flex"
                justifyContent="center"
                flexWrap="wrap"
                gap={3}
                mb={4}
            >

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Available:{" "}
                    <strong>
                        {availableSeats}
                    </strong>
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Held:{" "}
                    <strong>
                        {heldSeats}
                    </strong>
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Booked:{" "}
                    <strong>
                        {bookedSeats}
                    </strong>
                </Typography>

            </Box>


            {/* SELECTION SUMMARY */}

            <Paper
                elevation={3}
                sx={{
                    p: {
                        xs: 2,
                        sm: 3,
                    },
                    borderRadius: 3,

                    position: { xs: "relative", md: "sticky"},

                    bottom: { xs: 0, md: "auto" },

                    zIndex: 10,
                    backgroundColor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                }}
            >

                <Stack
                    direction={{
                        xs: "column",
                        md: "row",
                    }}
                    justifyContent="space-between"
                    alignItems={{
                        xs: "stretch",
                        md: "center",
                    }}
                    spacing={3}
                >

                    <Box>

                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                        >

                            <EventSeatIcon />

                            <Typography
                                variant="h6"
                                fontWeight="bold"
                            >
                                Selected Seats
                            </Typography>

                        </Stack>

                        <Typography
                            mt={1}
                            color="text.secondary"
                        >

                            {selectedSeats.length === 0
                                ? "No seats selected"
                                : selectedSeats
                                    .sort()
                                    .join(", ")}

                        </Typography>

                    </Box>


                    <Box
                        textAlign={{
                            xs: "left",
                            md: "right",
                        }}
                    >

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {selectedSeats.length}{" "}
                            {selectedSeats.length === 1
                                ? "Ticket"
                                : "Tickets"}
                        </Typography>

                        <Typography
                            variant="h5"
                            fontWeight="bold"
                        >
                            ₹{total}
                        </Typography>

                    </Box>

                </Stack>


                <Divider
                    sx={{
                        my: 3,
                    }}
                />


                {/* CONTINUE BUTTON */}

                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={
                        <ConfirmationNumberIcon />
                    }
                    disabled={
                        selectedSeats.length === 0 ||
                        !movieId ||
                        bookingLoading
                    }
                    onClick={
                        handleContinue
                    }
                    sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: "1rem",
                        fontWeight: "bold",
                    }}
                >

                    {bookingLoading
                        ? "Holding Seats..."
                        : "Continue to Checkout"}

                </Button>

            </Paper>

        </Box>

    );
}


// Legend Item

function LegendItem({
    color,
    label,
}: {
    color: string;
    label: string;
}) {

    return (

        <Box
            display="flex"
            alignItems="center"
            gap={1}
        >

            <Box
                sx={{
                    width: 20,
                    height: 20,
                    borderRadius:
                        "5px 5px 3px 3px",
                    backgroundColor:
                        color,
                }}
            />

            <Typography
                variant="body2"
            >
                {label}
            </Typography>

        </Box>

    );

}