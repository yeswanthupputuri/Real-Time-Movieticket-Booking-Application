
import { useEffect, useState } from "react";

import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Chip,
    Divider,
    Stack,
    Paper,
    Alert,
    CircularProgress,
} from "@mui/material";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import Countdown from "../../components/Countdown";

import {
    createPaymentSession,
} from "../../services/paymentService";

interface CheckoutState {
    showId: string;
    movieId?: string;
    seats: string[];
    total: number;
}

const CHECKOUT_STORAGE_KEY = "pendingMovieCheckout";

export default function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();

    const [savedBooking] = useState<CheckoutState | null>(() => {
        try {
            const saved = sessionStorage.getItem(
                CHECKOUT_STORAGE_KEY
            );

            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const booking = (
        location.state as CheckoutState | null
    ) ?? savedBooking;

    const [loading, setLoading] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");

    const [paymentCancelled, setPaymentCancelled] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);

        if (params.get("payment") === "cancelled") {
            setPaymentCancelled(true);
        }
    }, [location.search]);

    useEffect(() => {
        if (location.state) {
            try {
                sessionStorage.setItem(
                    CHECKOUT_STORAGE_KEY,
                    JSON.stringify(location.state)
                );
            } catch (error) {
                console.error(
                    "Unable to save checkout information:",
                    error
                );
            }
        }
    }, [location.state]);

    function goToSeatSelection() {
        if (!booking?.showId) {
            navigate("/home");
            return;
        }

        navigate(
            `/seat-selection/${booking.showId}`,
            {
                state: {
                    movieId: booking.movieId,
                },
            }
        );
    }

    function reservationExpired() {
        setErrorMessage(
            "Your seat reservation has expired. Please select your seats again."
        );

        sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);

        if (!booking?.showId){
            navigate("/home");
            return;
        }

        navigate(
            `/seat-selection/${booking.showId}`,
            {
                state: {
                    movieId: booking.movieId,
                },
            }
        );
    }

    async function confirmBooking() {
        if (loading) {
            return;
        }

        setErrorMessage("");

        if (!booking?.showId) {
            setErrorMessage("Show ID is missing.");
            return;
        }

        if (
            !Array.isArray(booking.seats) ||
            booking.seats.length === 0
        ) {
            setErrorMessage("No seats selected.");
            return;
        }

        setLoading(true);

        try {
            const response = await createPaymentSession({
                show_id: booking.showId,
                seats: booking.seats,
            });

            if (!response.checkout_url) {
                throw new Error(
                    "The backend did not return a Stripe Checkout URL."
                );
            }

            // Do not create a booking here.
            // Stripe's webhook will confirm it after payment verification.
            window.location.assign(response.checkout_url);

        } catch (error: unknown) {
            console.error(
                "Unable to start Stripe Checkout:",
                error
            );

            const apiError = error as {
                response?: {
                    data?: {
                        message?: string;
                    };
                };
                message?: string;
            };

            setErrorMessage(
                apiError.response?.data?.message ??
                apiError.message ??
                "Unable to start payment. Please try again."
            );

            setLoading(false);
        }
    }

    if (!booking) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="60vh"
                px={2}
            >
                <Card
                    sx={{
                        maxWidth: 500,
                        width: "100%",
                        textAlign: "center",
                        p: 3,
                    }}
                >
                    <CardContent>
                        <Typography
                            variant="h5"
                            fontWeight="bold"
                            gutterBottom
                        >
                            No Booking Selected
                        </Typography>

                        <Typography
                            color="text.secondary"
                            mb={3}
                        >
                            Please select your seats before
                            proceeding to checkout.
                        </Typography>

                        <Button
                            variant="contained"
                            onClick={() => navigate("/home")}
                        >
                            Back to Home
                        </Button>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    const total = Number(booking.total) || 0;

    const seatCount = booking.seats?.length || 0;

    const pricePerSeat =
        seatCount > 0 ? total / seatCount : 0;

    return (
        <Box
            sx={{
                maxWidth: 1000,
                mx: "auto",
                py: {
                    xs: 2,
                    md: 5,
                },
                px: {
                    xs: 1,
                    sm: 2,
                },
            }}
        >
            <Box mb={4}>
                <Typography
                    variant="h4"
                    fontWeight="bold"
                >
                    Checkout
                </Typography>

                <Typography
                    color="text.secondary"
                    mt={0.5}
                >
                    Review your booking before proceeding
                    to secure test payment.
                </Typography>
            </Box>

            {paymentCancelled && (
                <Alert
                    severity="warning"
                    sx={{ mb: 3 }}
                >
                    Payment was cancelled. Your booking has
                    not been confirmed. You can try again if
                    your seat reservation is still active.
                </Alert>
            )}

            {errorMessage && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    onClose={() => setErrorMessage("")}
                >
                    {errorMessage}
                </Alert>
            )}

            <Card
                elevation={4}
                sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                }}
            >
                <CardContent
                    sx={{
                        p: {
                            xs: 2,
                            sm: 3,
                            md: 4,
                        },
                    }}
                >
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                        gutterBottom
                    >
                        Booking Summary
                    </Typography>

                    <Typography
                        color="text.secondary"
                        mb={3}
                    >
                        Your selected seats are temporarily
                        reserved for 10 minutes.
                    </Typography>

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            mb: 3,
                        }}
                    >
                        <Stack spacing={2}>
                            <Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    mb={1}
                                >
                                    Selected Seats
                                </Typography>

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    flexWrap="wrap"
                                    useFlexGap
                                >
                                    {booking.seats.map(
                                        (seat: string) => (
                                            <Chip
                                                key={seat}
                                                label={seat}
                                                color="primary"
                                                variant="filled"
                                            />
                                        )
                                    )}
                                </Stack>
                            </Box>

                            <Divider />

                            <Box
                                display="flex"
                                justifyContent="space-between"
                            >
                                <Typography color="text.secondary">
                                    Number of Seats
                                </Typography>

                                <Typography fontWeight="bold">
                                    {seatCount}
                                </Typography>
                            </Box>

                            <Box
                                display="flex"
                                justifyContent="space-between"
                            >
                                <Typography color="text.secondary">
                                    Price per Seat
                                </Typography>

                                <Typography fontWeight="bold">
                                    ₹{pricePerSeat.toFixed(2)}
                                </Typography>
                            </Box>

                            <Divider />

                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                >
                                    Total Amount
                                </Typography>

                                <Typography
                                    variant="h5"
                                    fontWeight="bold"
                                    color="primary"
                                >
                                    ₹{total.toFixed(2)}
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            textAlign: "center",
                            mb: 3,
                        }}
                    >
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            gutterBottom
                        >
                            Reservation Time Remaining
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={2}
                        >
                            Complete checkout before your
                            seat reservation expires.
                        </Typography>

                        <Countdown
                            seconds={600}
                            onExpire={reservationExpired}
                        />
                    </Paper>

                    <Alert
                        severity="info"
                        sx={{ mb: 3 }}
                    >
                        This checkout uses Stripe test mode.
                        No real payment is collected. Your
                        booking will be confirmed only after
                        the backend verifies successful payment.
                    </Alert>

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={confirmBooking}
                        disabled={loading}
                        sx={{
                            py: 1.5,
                            fontSize: "1rem",
                            fontWeight: "bold",
                            borderRadius: 2,
                        }}
                    >
                        {loading ? (
                            <>
                                <CircularProgress
                                    size={22}
                                    color="inherit"
                                    sx={{ mr: 1 }}
                                />
                                Redirecting to Stripe...
                            </>
                        ) : (
                            "Proceed to Payment"
                        )}
                    </Button>

                    <Button
                        fullWidth
                        variant="text"
                        disabled={loading}
                        sx={{ mt: 1 }}
                        onClick={goToSeatSelection}
                    >
                        Back to Seat Selection
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
}
