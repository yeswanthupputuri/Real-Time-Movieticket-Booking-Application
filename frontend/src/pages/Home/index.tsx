import { useEffect, useMemo, useState } from "react";

import {
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";

import type { SelectChangeEvent } from "@mui/material";
import MovieCard from "../../components/MovieCard/MovieCard";
import { getMovies } from "../../services/movieService";
import type { Movie } from "../../types/movie";

export default function Home() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [search, setSearch] = useState("");
    const [genre, setGenre] = useState("ALL");
    const [language, setLanguage] = useState("ALL");

    // Load Movies
    useEffect(() => {
        async function loadMovies() {
            try {
                const data = await getMovies();
                setMovies(data);

            } catch (err) {
                console.error(
                    "Failed to load movies:", err
                );
            }
        }
        loadMovies();
    }, []);

    // Create Filter Options

    const genres =
        useMemo(() => {
            const values =
                movies.map( (movie) => movie.genre );
            return Array.from(
                new Set(values)
            ).sort();
        }, [movies]);

    const languages =
        useMemo(() => {
            const values =
                movies.map(
                    (movie) =>
                        movie.language
                );
            return Array.from(
                new Set(values)
            ).sort();
        }, [movies]);

    // Filter Movies
    const filteredMovies =
        useMemo(() => {
            const searchValue =
                search
                    .trim()
                    .toLowerCase();

            return movies.filter(
                (movie) => {
                    const matchesSearch =
                        movie.title
                            .toLowerCase()
                            .includes(
                                searchValue
                            );
                    const matchesGenre = genre === "ALL" || movie.genre === genre;
                    const matchesLanguage = language === "ALL" || movie.language === language;

                    return (
                        matchesSearch &&
                        matchesGenre &&
                        matchesLanguage
                    );
                }
            );
        }, [
            movies,
            search,
            genre,
            language,
        ]);

    // Clear Filters
    function clearFilters() {
        setSearch("");
        setGenre("ALL");
        setLanguage("");
    }

    return (
        <Box>
            {/* PAGE HEADER*/}

            <Box mb={4}>

                <Typography
                    variant="h4"
                    fontWeight="bold"
                >
                    Now Showing
                </Typography>

                <Typography
                    color="text.secondary"
                    mt={0.5}
                >
                    Find your next movie
                </Typography>

            </Box>


            {/* SEARCH & FILTERS */}

            <Box
                sx={{
                    display: "flex",
                    flexDirection: {
                        xs: "column",
                        md: "row",
                    },
                    gap: 2,
                    mb: 4,
                    alignItems: {
                        xs: "stretch",
                        md: "center",
                    },
                }}
            >

                {/* Search */}

                <TextField
                    fullWidth
                    label="Search movies"
                    placeholder="Search by movie title..."
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />

                {/* Genre */}
                <FormControl
                    sx={{
                        minWidth: {
                            xs: "100%",
                            md: 180,
                        },
                    }}
                >

                    <InputLabel>
                        Genre
                    </InputLabel>

                    <Select
                        value={genre}
                        label="Genre"
                        onChange={(
                            e: SelectChangeEvent
                        ) =>
                            setGenre(
                                e.target.value
                            )
                        }
                    >

                        <MenuItem value="ALL">
                            All Genres
                        </MenuItem>

                        {genres.map(
                            (item) => (

                                <MenuItem
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </MenuItem>

                            )
                        )}

                    </Select>
                </FormControl>


                {/* Language */}
                <FormControl
                    sx={{
                        minWidth: {
                            xs: "100%",
                            md: 180,
                        },
                    }}
                >
                    <InputLabel>
                        Language
                    </InputLabel>

                    <Select
                        value={language}
                        label="Language"
                        onChange={(
                            e: SelectChangeEvent
                        ) =>
                            setLanguage(
                                e.target.value
                            )
                        }
                    >

                        <MenuItem value="ALL">
                            All Languages
                        </MenuItem>

                        {languages.map(
                            (item) => (

                                <MenuItem
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </MenuItem>

                            )
                        )}

                    </Select>
                </FormControl>


                {/* Clear */}
                <Button
                    variant="outlined"
                    onClick={
                        clearFilters
                    }
                    sx={{
                        height: 56,
                        minWidth: 120,
                    }}
                >
                    Clear
                </Button>

            </Box>


            {/* RESULT COUNT */}

            <Typography
                variant="body2"
                color="text.secondary"
                mb={3}
            >
                {filteredMovies.length}{" "}
                {filteredMovies.length === 1
                    ? "movie"
                    : "movies"}{" "}
                found
            </Typography>


            {/* MOVIE GRID */}

            {filteredMovies.length > 0 ? (
                <Grid
                    container
                    spacing={3}
                >

                    {filteredMovies.map(
                        (movie) => (

                            <Grid
                                key={movie._id}
                                size={{
                                    xs: 12, sm: 6, md: 4, lg: 3,
                                }}
                                sx={{
                                    display: "flex",
                                    justifyContent: {
                                        xs: "center",
                                        sm: "flex-start",
                                    },
                                }}
                            >

                                <MovieCard
                                    movie={movie}
                                />

                            </Grid>

                        )
                    )}

                </Grid>

            ) : (

                <Box
                    sx={{
                        textAlign: "center", py: 8,
                    }}
                >

                    <Typography
                        variant="h6"
                        fontWeight="bold"
                    >
                        No movies found
                    </Typography>

                    <Typography
                        color="text.secondary"
                        mt={1}
                    >
                        Try changing your search
                        or filters.
                    </Typography>

                    <Button
                        variant="outlined"
                        sx={{
                            mt: 3,
                        }}
                        onClick={
                            clearFilters
                        }
                    >
                        Clear Filters
                    </Button>
                </Box>

            )}

        </Box>

    );

}