import { useEffect, useState, } from "react";

import { Typography,
} from "@mui/material";

interface Props {
    seconds: number;
    onExpire: () => void;
}

export default function Countdown({
    seconds, onExpire,

}: Props) {

    const [timeLeft, setTimeLeft] =
        useState(seconds);
    useEffect(() => {

        if (timeLeft <= 0) {
            onExpire();
            return;
        }
        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1);

        }, 1000);
        return () => clearTimeout(timer);

    }, [timeLeft]);

    const minutes = Math.floor(
        timeLeft / 60
    );

    const secondsLeft = timeLeft % 60;

    return (
        <Typography
            color="error"
            fontWeight="bold"
            fontSize={22}
        >
            {String(minutes).padStart(2, "0")}
            :
            {String(secondsLeft).padStart(2, "0")}
        </Typography>
    );

}