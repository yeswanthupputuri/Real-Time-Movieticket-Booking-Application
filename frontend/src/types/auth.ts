import type { User } from "firebase/auth";
export interface AuthContextType {

    user: User | null;
    loading: boolean;
    role: string | null;

    login: (
        email: string,
        password: string
    ) => Promise<void>;

    register: (
        name: string,
        email: string,
        password: string,
        role: string
    ) => Promise<void>;

    updateUsername: (
        username: string
    ) => Promise<void>;

    changePassword: (
        currentPassword: string,
        newPassword: string
    ) => Promise<void>;

    logout: () => Promise<void>;
    getToken: () => Promise<string>;

}