import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Divider,
    Stack,
    Typography,
} from "@mui/material";

import type {
    Booking,
} from "../types/booking";

interface Props {
    booking: Booking;
}

export default function BookingCard({
    booking,
}: Props) {

    const posterUrl =
        `http://127.0.0.1:8000/${booking.movie.poster}`;

    const bookingDate =
        new Date(
            booking.booked_at
        ).toLocaleString();

    return (

        <Card
            elevation={3}
            sx={{
                display: "flex",

                flexDirection: {
                    xs: "column", sm: "row",
                },

                overflow: "hidden",
                borderRadius: 3,
            }}
        >

            {/*MOVIE POSTER*/}

            <CardMedia
                component="img"
                image={posterUrl}
                alt={booking.movie.title}
                sx={{
                    width: {
                        xs: "100%", sm: 180,
                    },

                    height: {
                        xs: 320, sm: 260,
                    },

                    objectFit: "cover",
                    flexShrink: 0,
                }}
            />

            {/* BOOKING INFORMATION */}

            <CardContent
                sx={{
                    flex: 1,

                    p: {
                        xs: 2, sm: 3,
                    },
                }}
            >

                {/* TITLE + STATUS */}

                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems={{
                        xs: "flex-start",
                        sm: "center",
                    }}
                    gap={2}
                    mb={2}
                >
                    <Box
                        sx={{
                            minWidth: 0,
                        }}
                    >
                        <Typography
                            variant="h5"
                            fontWeight="bold"
                            sx={{
                                fontSize: {
                                    xs: "1.3rem", sm: "1.5rem",
                                },

                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {booking.movie.title}
                        </Typography>

                        <Typography
                            color="text.secondary"
                            mt={0.5}
                        >
                            {booking.movie.language}
                            {" • "}
                            {booking.movie.genre}
                        </Typography>

                    </Box>


                    <Chip
                        label={booking.status}
                        color={
                            booking.status === "confirmed"
                                ? "success"
                                : "default"
                        }
                        size="small"
                    />
                </Box>

                <Divider
                    sx={{
                        mb: 2,
                    }}
                />


                {/* =================================
                    BOOKING DETAILS
                ================================= */}

                <Stack
                    spacing={1.2}
                >

                    <Typography>
                        <strong>Theatre:</strong>{" "}
                        {booking.show.theatre}
                    </Typography>

                    <Typography>
                        <strong>City:</strong>{" "}
                        {booking.show.city}
                    </Typography>

                    <Typography>
                        <strong>Screen:</strong>{" "}
                        {booking.show.screen}
                    </Typography>

                    <Typography>
                        <strong>Date:</strong>{" "}
                        {booking.show.date}
                    </Typography>

                    <Typography>
                        <strong>Time:</strong>{" "}
                        {booking.show.time}
                    </Typography>

                    <Typography>
                        <strong>Seats:</strong>{" "}
                        {booking.seats.join(", ")}
                    </Typography>

                    <Typography>
                        <strong>Amount:</strong>{" "}
                        ₹{booking.amount}
                    </Typography>

                </Stack>

                <Divider
                    sx={{
                        my: 2,
                    }}
                />

                {/* BOOKING META */}

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Booking ID: {booking._id}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    mt={0.5}
                >
                    Booked on: {bookingDate}
                </Typography>

            </CardContent>

        </Card>

    );
}