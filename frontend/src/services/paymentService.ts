
import api from "./api";

export interface CreatePaymentSessionPayload {
    show_id: string;
    seats: string[];
}

export interface CreatePaymentSessionResponse {
    payment_id: string;
    checkout_url: string;
}

export interface PaymentStatusResponse {
    payment_status: string;
    message: string;
    booking_id: string | null;
}

export async function createPaymentSession(
    payload: CreatePaymentSessionPayload
): Promise<CreatePaymentSessionResponse> {
    const response = await api.post<CreatePaymentSessionResponse>(
        "/bookings/payment/create-session/",
        payload
    );

    return response.data;
}

export async function getPaymentStatus(
    sessionId: string
): Promise<PaymentStatusResponse> {
    const response = await api.get<PaymentStatusResponse>(
        "/bookings/payment/status/",
        {
            params: {
                session_id: sessionId,
            },
        }
    );

    return response.data;
}
