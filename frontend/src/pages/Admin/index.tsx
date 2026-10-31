import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { useState } from "react";

import { useAuth } from "../../contexts/AuthContext";

import { createMovie } from "../../services/movieService";

export default function Admin() {
    const { getToken } = useAuth();

    // Create Movie form fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [genre, setGenre] = useState("");
    const [language, setLanguage] = useState("");
    const [duration, setDuration] = useState("");
    const [poster, setPoster] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit() {
        setError("");
        setSuccess("");

        if (
            !title.trim() ||
            !description.trim() ||
            !genre.trim() ||
            !language.trim() ||
            !duration.trim()
        ) {
            setError("Please complete all movie fields.");
            return;
        }

        if (!Number.isFinite(Number(duration)) || Number(duration) <= 0) {
            setError("Duration must be a positive number.");
            return;
        }

        if (!poster) {
            setError("Please select a movie poster.");
            return;
        }

        try {
            setLoading(true);

            const token = await getToken();
            const formData = new FormData();

            formData.append("title", title.trim());
            formData.append("description", description.trim());
            formData.append("genre", genre.trim());
            formData.append("language", language.trim());
            formData.append("duration", duration);
            formData.append("poster", poster);

            await createMovie(formData);

            setSuccess("Movie created successfully.");
            setTitle("");
            setDescription("");
            setGenre("");
            setLanguage("");
            setDuration("");
            setPoster(null);

            // Reset the file input after a successful submission.
            const fileInput = document.getElementById(
                "movie-poster-input",
            ) as HTMLInputElement | null;
            if (fileInput) {
                fileInput.value = "";
            }
        } catch (err) {
            console.error("Movie creation failed:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Movie creation failed. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <Box
            sx={{
                maxWidth: 760,
                mx: "auto",
                p: { xs: 2, sm: 3 },
            }}
        >
            <Card elevation={2} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Create Movie
                    </Typography>

                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        Enter the movie details and upload its poster.
                    </Typography>

                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            required
                            label="Movie Title"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            disabled={loading}
                        />

                        <TextField
                            fullWidth
                            required
                            multiline
                            minRows={4}
                            label="Description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            disabled={loading}
                        />

                        <TextField
                            fullWidth
                            required
                            label="Genre"
                            value={genre}
                            onChange={(event) => setGenre(event.target.value)}
                            disabled={loading}
                        />

                        <TextField
                            fullWidth
                            required
                            label="Language"
                            value={language}
                            onChange={(event) => setLanguage(event.target.value)}
                            disabled={loading}
                        />

                        <TextField
                            fullWidth
                            required
                            type="number"
                            label="Duration (minutes)"
                            value={duration}
                            onChange={(event) => setDuration(event.target.value)}
                            inputProps={{ min: 1 }}
                            disabled={loading}
                        />

                        <Box>
                            <Button
                                component="label"
                                variant="outlined"
                                disabled={loading}
                            >
                                Upload Poster
                                <input
                                    id="movie-poster-input"
                                    hidden
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                        setPoster(event.target.files?.[0] ?? null)
                                    }
                                />
                            </Button>

                            {poster && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 1 }}
                                >
                                    Selected: {poster.name}
                                </Typography>
                            )}
                        </Box>

                        {error && <Alert severity="error">{error}</Alert>}
                        {success && <Alert severity="success">{success}</Alert>}

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading}
                            sx={{ mt: 1 }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                "Create Movie"
                            )}
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}
