export interface BookingMovie {

    title: string;
    poster: string;
    language: string;
    genre: string;
    duration: number;

}

export interface BookingShow {

    theatre: string;
    city: string;
    screen: string;
    date: string;
    time: string;
    price: number;

}

export interface Booking {

    _id: string;
    movie: BookingMovie;
    show: BookingShow;
    seats: string[];
    amount: number;
    status: string;
    booked_at: string;
}