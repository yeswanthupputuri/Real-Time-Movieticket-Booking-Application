import {
    Box,
    Button,
    Tooltip,
} from "@mui/material";

interface Props {
    seatNumber: string;
    status: "available" | "held" | "booked";
    selected: boolean;
    onClick: () => void;
}

export default function Seat({
    seatNumber,
    status,
    selected,
    onClick,
}: Props) {

    let backgroundColor = "#43a047";

    if (status === "held") {
        backgroundColor = "#fb8c00";
    }

    if (status === "booked") {
        backgroundColor = "#e53935";
    }

    if (selected) {
        backgroundColor = "#1976d2";
    }

    const disabled =
        status !== "available";

    const seatButton = (
        <Button
            onClick={onClick}
            disabled={disabled}
            variant="contained"
            aria-label={`Seat ${seatNumber}`}
            sx={{
                minWidth: {
                    xs: 36, sm: 44, md: 48,
                },

                width: {
                    xs: 36, sm: 44, md: 48,
                },

                height: {
                    xs: 36, sm: 44, md: 48,
                },

                p: 0,

                borderRadius:
                    "8px 8px 5px 5px",

                backgroundColor,
                color: "#fff",
                fontWeight: 700,
                fontSize: {
                    xs: "0.65rem",
                    sm: "0.75rem",
                    md: "0.8rem",
                },

                boxShadow: selected
                    ? "0 0 0 3px rgba(25,118,210,0.25), 0 4px 8px rgba(0,0,0,0.2)"
                    : "0 2px 5px rgba(0,0,0,0.15)",

                transition: "transform 0.15s ease, box-shadow 0.15s ease",

                "&:hover": {
                    backgroundColor,

                    transform:
                        disabled
                            ? "none"
                            : "translateY(-2px)",

                    boxShadow:
                        disabled
                            ? undefined
                            : "0 5px 10px rgba(0,0,0,0.2)",
                },

                "&:active": {
                    transform:
                        disabled
                            ? "none"
                            : "scale(0.94)",
                },

                "&.Mui-disabled": {
                    backgroundColor,
                    color: "#fff",
                    opacity: 0.8,
                },
            }}
        >
            {seatNumber}
        </Button>
    );

    if (status === "available") {
        return seatButton;
    }

    return (
        <Tooltip
            title={
                status === "booked"
                    ? "Already booked"
                    : "Currently held"
            }
            arrow
        >
            <Box>
                {seatButton}
            </Box>
        </Tooltip>
    );
}