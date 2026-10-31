import api from "./api";

import type {
    Movie,
} from "../types/movie";

// Create Movie
export async function createMovie(
    formData: FormData
) {
    const response =
        await api.post(
            "/movies/create/",
            formData,
            {
                headers: {
                    "Content-Type":
                        "multipart/form-data",
                },
            }
        );
    return response.data;
}

// Get All Movies

export async function getMovies(): Promise<Movie[]> {
    const response =
        await api.get(
            "/movies/"
        );
    return response.data;
    
}

// Get Single Movie

export async function getMovie(
    movieId: string
): Promise<Movie> {
    const response =
        await api.get(
            `/movies/${movieId}/`
        );
    return response.data;
}

// Get Movies Created By Current Admin

export async function getAdminMovies(): Promise<Movie[]> {
    const response =
        await api.get(
            "/movies/admin/"
        );
    return response.data;
}

// Update Movie

export async function updateMovie(
    movieId: string,
    formData: FormData
) {
    const response =
        await api.patch(
            `/movies/${movieId}/update/`,
            formData,
            {
                headers: {
                    "Content-Type":
                        "multipart/form-data",
                },
            }
        );
    return response.data;
}