export interface Seat {

    _id: string;
    show_id: string;
    seat_number: string;
    status: "available" | "held" | "booked";
    locked_by: string | null;
    lock_expiry: string | null;

}