import api from "./api";

export interface AdminDashboard {

    total_movies: number;
    total_shows: number;
    total_bookings: number;
    confirmed_bookings: number;
    total_revenue: number;
    total_seats: number;
    booked_seats: number;
    held_seats: number;
    available_seats: number;

}

export async function getDashboardStatistics(): Promise<AdminDashboard> {
    const response =
        await api.get(
            "/admin/dashboard/"
        );
    return response.data;
}