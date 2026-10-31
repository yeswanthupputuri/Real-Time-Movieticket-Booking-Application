import api from "./api";

interface RegisterPayload {
    firebase_uid: string;
    name: string;
    email: string;
    role: string;
}

export async function createUserProfile(
    payload: RegisterPayload
) {
    const response =
        await api.post( "/users/register/", payload );
    return response.data;
}

export async function getCurrentUser() {
    const response =
        await api.get(  "/users/me/" );
    return response.data;

}

export async function updateCurrentUser(
    name: string
) {
    const response =
        await api.patch(
            "/users/me/",
            {
                name,
            }
        );
    return response.data;
}