import api from "./api";
import type { Show } from "../types/show";

export interface CreateShowPayload {
    movie_id: string;
    theatre: string;
    city: string;
    screen: string;
    show_date: string;
    show_time: string;
    price: number;
}

export interface CreateShowResponse {
    message: string;
    show_id: string;
}

export interface UpdateShowResponse {
    message: string;
    show: Show;
}

export async function createShow(
    payload: CreateShowPayload,
): Promise<CreateShowResponse> {
    const response = await api.post<CreateShowResponse>(
        "/shows/create/",
        payload,
    );
    return response.data;
}

export async function updateShow(
    showId: string,
    payload: CreateShowPayload,
): Promise<UpdateShowResponse> {
    const response = await api.put<UpdateShowResponse>(
        `/shows/${encodeURIComponent(showId)}/update/`,
        payload,
    );
    return response.data;
}

export interface CancelShowResponse {
    message: string;
    show_id: string;
    status: "cancelled";
}

export async function cancelShow(showId: string): Promise<CancelShowResponse> {
    const response = await api.post<CancelShowResponse>(
        `/shows/${encodeURIComponent(showId)}/cancel/`,
    );
    return response.data;
}

export async function getShowsByMovie(
    movieId: string,
    includeCancelled = false,
): Promise<Show[]> {
    const response = await api.get<Show[]>(
        `/shows/movie/${encodeURIComponent(movieId)}/`,
        { params: { include_cancelled: includeCancelled ? "true" : "false" } },
    );
    return response.data;
}

export async function getShow(showId: string): Promise<Show> {
    const response = await api.get<Show>(
        `/shows/${encodeURIComponent(showId)}/`,
    );
    return response.data;
}
