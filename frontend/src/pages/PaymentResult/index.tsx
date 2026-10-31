
import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
    getPaymentStatus,
    type PaymentStatusResponse,
} from "../../services/paymentService";

const MAX_ATTEMPTS = 15;
const POLL_INTERVAL_MS = 2000;

export default function PaymentResult() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const sessionId = searchParams.get("session_id");

    const [payment, setPayment] =
        useState<PaymentStatusResponse | null>(null);

    const [loading, setLoading] = useState(true);
    const [attempt, setAttempt] = useState(0);
    const [retryKey, setRetryKey] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!sessionId) {
            setErrorMessage(
                "The Stripe Checkout Session ID is missing."
            );
            setLoading(false);
            return;
        }

        let cancelled = false;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        async function checkStatus() {
            try {
                setErrorMessage("");

                const result = await getPaymentStatus(sessionId!);

                if (cancelled) return;

                setPayment(result);
                setLoading(false);

                const terminalStatuses = [
                    "paid",
                    "failed",
                    "expired",
                    "verification_failed",
                    "paid_booking_failed",
                    "session_creation_failed",
                ];

                if (terminalStatuses.includes(result.payment_status)) {
                    return;
                }

                if (attempt + 1 < MAX_ATTEMPTS) {
                    timeoutId = setTimeout(() => {
                        if (!cancelled) {
                            setAttempt((current) => current + 1);
                        }
                    }, POLL_INTERVAL_MS);
                } else {
                    setErrorMessage(
                        "Payment confirmation is taking longer than expected. You can check again shortly."
                    );
                }
            } catch (error: unknown) {
                if (cancelled) return;

                console.error("Unable to fetch payment status:", error);

                setLoading(false);
                setErrorMessage(
                    "Unable to retrieve your payment status. Please try again."
                );
            }
        }

        void checkStatus();

        return () => {
            cancelled = true;

            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [sessionId, attempt, retryKey]);

    const paymentStatus = payment?.payment_status;

    const isSuccess =
        paymentStatus === "paid" && Boolean(payment?.booking_id);

    const isBookingFailure =
        paymentStatus === "paid_booking_failed";

    const isFailure =
        paymentStatus === "failed" ||
        paymentStatus === "expired" ||
        paymentStatus === "verification_failed" ||
        paymentStatus === "session_creation_failed";

    const isWaiting =
        !payment ||
        paymentStatus === "pending" ||
        paymentStatus === "processing";

    let title = "Checking your payment";
    let description =
        "Please wait while we check the payment and booking status.";
    let icon = <HourglassTopIcon sx={{ fontSize: 64 }} />;

    if (isSuccess) {
        title = "Booking Confirmed!";
        description =
            "Your payment was verified and your booking has been confirmed.";
        icon = (
            <CheckCircleOutlineIcon
                color="success"
                sx={{ fontSize: 64 }}
            />
        );
    } else if (isBookingFailure) {
        title = "Booking Confirmation Needs Attention";
        description =
            "The payment succeeded, but the booking could not be confirmed. Please contact support.";
        icon = (
            <ErrorOutlineIcon
                color="error"
                sx={{ fontSize: 64 }}
            />
        );
    } else if (isFailure) {
        title = "Payment Not Completed";
        description =
            payment?.message ||
            "The payment could not be completed.";
        icon = (
            <ErrorOutlineIcon
                color="error"
                sx={{ fontSize: 64 }}
            />
        );
    } else if (isWaiting && !errorMessage) {
        title = "Payment Confirmation Pending";
        description =
            payment?.message ||
            "We are waiting for confirmation from Stripe.";
    }

    function checkAgain() {
        setErrorMessage("");
        setLoading(true);
        setPayment(null);
        setAttempt(0);
        setRetryKey((current) => current + 1);
    }

    return (
        <Box
            sx={{
                minHeight: "70vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
                py: 5,
            }}
        >
            <Card
                elevation={4}
                sx={{
                    maxWidth: 560,
                    width: "100%",
                    borderRadius: 3,
                }}
            >
                <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
                    <Stack spacing={2.5} alignItems="center">
                        {loading ? (
                            <CircularProgress size={54} />
                        ) : (
                            icon
                        )}

                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            textAlign="center"
                        >
                            {loading ? "Checking Payment..." : title}
                        </Typography>

                        <Typography
                            color="text.secondary"
                            textAlign="center"
                        >
                            {loading
                                ? "Please keep this page open while we check your payment."
                                : description}
                        </Typography>

                        {payment && (
                            <Box sx={{ width: "100%", pt: 1 }}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Payment status
                                </Typography>

                                <Typography
                                    fontWeight="bold"
                                    sx={{ overflowWrap: "anywhere" }}
                                >
                                    {payment.payment_status}
                                </Typography>

                                {isSuccess && payment.booking_id && (
                                    <>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mt: 2 }}
                                        >
                                            Booking reference
                                        </Typography>

                                        <Typography
                                            fontWeight="bold"
                                            sx={{ overflowWrap: "anywhere" }}
                                        >
                                            {payment.booking_id}
                                        </Typography>
                                    </>
                                )}
                            </Box>
                        )}

                        {errorMessage && (
                            <Alert
                                severity={
                                    isBookingFailure
                                        ? "error"
                                        : "info"
                                }
                                sx={{ width: "100%" }}
                            >
                                {errorMessage}
                            </Alert>
                        )}

                        {isBookingFailure && (
                            <Alert severity="warning" sx={{ width: "100%" }}>
                                Do not pay again immediately. Check your booking history or contact support so the successful payment can be investigated.
                            </Alert>
                        )}

                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1.5}
                            sx={{ width: "100%", pt: 1 }}
                        >
                            {(errorMessage || isWaiting) && !loading && (
                                <Button
                                    variant="contained"
                                    onClick={checkAgain}
                                    fullWidth
                                >
                                    Check Again
                                </Button>
                            )}

                            <Button
                                variant={isSuccess ? "contained" : "outlined"}
                                onClick={() => navigate("/home")}
                                fullWidth
                            >
                                Back to Home
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}
