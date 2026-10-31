import {
    Box,
    CircularProgress,
    Stack,
    Typography,
} from "@mui/material";

import {
    useEffect,
    useState,
} from "react";

import {
    getMyBookings,
} from "../../services/bookingService";

import type {
    Booking,
} from "../../types/booking";

import BookingCard from "../../components/BookingCard";

export default function MyBookings() {

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadBookings() {
            try {
                setLoading(true);
                setError("");

                const data =
                    await getMyBookings();
                setBookings(data);

            } catch (error) {
                console.error(
                    "Failed to load bookings:",
                    error
                );
                setError(
                    "Unable to load your bookings. Please try again."
                );
            } finally {
                setLoading(false);
            }
        }
        loadBookings();

    }, []);


    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                mt={8}
            >
                <CircularProgress />
            </Box>
        );
    }


    if (error) {
        return (
            <Box>
                <Typography
                    variant="h4"
                    mb={4}
                >
                    My Bookings
                </Typography>

                <Typography
                    color="error"
                >
                    {error}
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography
                variant="h4"
                mb={4}
            >
                My Bookings
            </Typography>

            {bookings.length === 0 ? (
                <Typography
                    color="text.secondary"
                >
                    No bookings yet.
                </Typography>
            ) : (
                <Stack spacing={3}>

                    {bookings.map((booking) => (
                        <BookingCard
                            key={booking._id}
                            booking={booking}
                        />
                    ))}
                </Stack>
            )}
        </Box>
    );
}