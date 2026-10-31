import api from "./api";

export async function getSeats(
    showId: string
) {
    const response = await api.get(
        `/seats/show/${showId}/`
    );
    return response.data;
}

export async function holdSeats(
    showId: string,
    seatNumbers: string[]
) {
    const response = await api.post(
        "/seats/hold/",
        {
            show_id: showId,
            seat_numbers: seatNumbers,
        }
    );
    return response.data;
}