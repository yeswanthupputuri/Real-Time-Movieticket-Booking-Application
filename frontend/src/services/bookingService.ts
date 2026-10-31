import api from "./api";

export interface BookingPayload {
    show_id: string;
    seats: string[];
}

export async function createBooking(
    payload: BookingPayload
) {
    const response = await api.post(
        "/bookings/create/",
        payload
    );
    return response.data;
}

export async function getMyBookings() {
    const response = await api.get(
        "/bookings/my/"
    );
    return response.data;
}