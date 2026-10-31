import {
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Typography,
    Chip,
    Stack,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import type { Movie } from "../../types/movie";

interface Props {
    movie: Movie;
}

export default function MovieCard({ movie }: Props) {
    const navigate = useNavigate();

    return (
        <Card
            sx={{
                width: 260,
                borderRadius: 3,
                transition: "0.3s",
                "&:hover": {
                    transform: "scale(1.03)",
                    boxShadow: 8,
                },
            }}
        >
            <CardActionArea
                onClick={() =>
                    navigate(`/movie/${movie._id}`)
                }
            >
                <CardMedia
                    component="img"
                    height="360"
                    image={`http://127.0.0.1:8000/${movie.poster}`}
                    alt={movie.title}
                />

                <CardContent>

                    <Typography
                        variant="h6"
                        gutterBottom
                    >
                        {movie.title}
                    </Typography>

                    <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                    >

                        <Chip
                            label={movie.genre}
                            size="small"
                        />

                        <Chip
                            label={movie.language}
                            size="small"
                        />

                        <Chip
                            label={`${movie.duration} min`}
                            size="small"
                        />

                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}