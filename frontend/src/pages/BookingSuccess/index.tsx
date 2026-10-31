import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Divider,
    Stack,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

export default function BookingSuccess() {

    const navigate =
        useNavigate();

    const location =
        useLocation();

    const bookingId =
        location.state?.bookingId;

    return (

        <Box
            sx={{
                minHeight: "70vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                px: 2,
                py: 5,
            }}
        >

            <Card
                elevation={5}
                sx={{
                    maxWidth: 600,
                    width: "100%",
                    borderRadius: 4,
                }}
            >

                <CardContent
                    sx={{
                        textAlign: "center",
                        p: {
                            xs: 3,
                            sm: 5,
                        },
                    }}
                >

                    {/* SUCCESS ICON */}

                    <CheckCircleIcon
                        color="success"
                        sx={{
                            fontSize: 90,
                            mb: 2,
                        }}
                    />

                    {/* SUCCESS MESSAGE */}

                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        color="success.main"
                        sx={{
                            fontSize: {
                                xs: "2rem",
                                sm: "2.5rem",
                            },
                        }}
                    >
                        Booking Confirmed!
                    </Typography>


                    <Typography
                        color="text.secondary"
                        mt={2}
                    >
                        Your movie tickets have been
                        successfully booked.
                    </Typography>


                    <Typography
                        color="text.secondary"
                    >
                        Enjoy the show! 🎬
                    </Typography>


                    {/* BOOKING ID */}

                    <Card
                        variant="outlined"
                        sx={{
                            mt: 4,
                            mb: 4,
                            borderRadius: 2,
                        }}
                    >

                        <CardContent>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Booking ID
                            </Typography>

                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{
                                    mt: 1,
                                    wordBreak:
                                        "break-all",
                                }}
                            >
                                {bookingId ??
                                    "Unavailable"}
                            </Typography>

                        </CardContent>

                    </Card>


                    {/* CONFIRMATION DETAILS */}

                    <Divider sx={{ mb: 3 }} />

                    <Stack
                        spacing={1}
                        mb={4}
                    >

                        <Typography>
                            Your seats have been
                            successfully confirmed.
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            You can view your complete
                            booking details in My Bookings.
                        </Typography>

                    </Stack>


                    {/* ACTION BUTTONS */}

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{
                            py: 1.5,
                            fontWeight: "bold",
                            borderRadius: 2,
                        }}
                        onClick={() =>
                            navigate("/bookings")
                        }
                    >
                        View My Bookings
                    </Button>


                    <Button
                        fullWidth
                        variant="outlined"
                        size="large"
                        sx={{
                            mt: 2,
                            py: 1.5,
                            borderRadius: 2,
                        }}
                        onClick={() =>
                            navigate("/home")
                        }
                    >
                        Back to Home
                    </Button>

                </CardContent>

            </Card>

        </Box>

    );

}