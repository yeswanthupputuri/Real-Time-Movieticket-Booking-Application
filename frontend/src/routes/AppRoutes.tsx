
import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";

import Home from "../pages/Home";
import MovieDetails from "../pages/MovieDetails";
import ShowSelection from "../pages/ShowSelection";
import SeatSelection from "../pages/SeatSelection";
import Checkout from "../pages/Checkout";
import MyBookings from "../pages/MyBookings";
import Profile from "../pages/Profile";
import Admin from "../pages/Admin";
import BookingSuccess from "../pages/BookingSuccess";
import PaymentResult from "../pages/PaymentResult";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* Protected Routes */}
                <Route
                    element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route
                        path="/home"
                        element={<Home />}
                    />

                    <Route
                        path="/movie/:movieId"
                        element={<MovieDetails />}
                    />

                    <Route
                        path="/show/:movieId"
                        element={<ShowSelection />}
                    />

                    <Route
                        path="/seat-selection/:showId"
                        element={<SeatSelection />}
                    />

                    <Route
                        path="/checkout"
                        element={<Checkout />}
                    />
                    
                    <Route
                        path="/payment-result"
                        element={<PaymentResult />}
                    />

                    <Route
                        path="/bookings"
                        element={<MyBookings />}
                    />

                    <Route
                        path="/profile"
                        element={<Profile />}
                    />

                    <Route
                        path="/admin"
                        element={<Admin />}
                    />

                    <Route
                        path="/booking-success"
                        element={<BookingSuccess />}
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
