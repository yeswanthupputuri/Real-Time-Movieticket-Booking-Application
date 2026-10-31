import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import type { User, } from "firebase/auth";
import { onAuthStateChanged, } from "firebase/auth";
import { auth, } from "../firebase/firebase";
import type { AuthContextType, } from "../types/auth";

import {
    loginUser,
    logoutUser,
    registerUser,
    updateUsername as updateFirebaseUsername,
    changePassword as changeFirebasePassword,
} from "../services/authService";

import {
    createUserProfile,
    getCurrentUser,
    updateCurrentUser,
} from "../services/userService";

// Context
const AuthContext = createContext<AuthContextType | null>(null);

// Props
interface Props {
    children: ReactNode;
}

// Auth Provider
export function AuthProvider({
    children,
}: Props) {

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);

    // Load Backend User Profile
  
    async function loadUserRole() {
        try {
            const data = await getCurrentUser();

            console.log("Current backend user:",data);
            setRole(data.role ?? null);
        } catch (error) {
            console.error(
                "Failed to load user profile:", error
            );
            setRole(null);
        }
    }

    // Firebase Authentication State

    useEffect(() => {
        const unsubscribe =
            onAuthStateChanged(
                auth,
                async (currentUser) => {
                    setUser(currentUser);
                    if (currentUser) {
                        await loadUserRole();
                    } else {
                        setRole(null);
                    }
                    setLoading(false);
                }
            );
        return unsubscribe;

    }, []);

    // Login

    async function login(
        email: string,
        password: string
    ) {
        const firebaseUser =
            await loginUser(
                email, password
            );

        const token = await firebaseUser.getIdToken();
        console.log("Firebase Token:");
        console.log({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
        });
        console.log( token );
        setUser(firebaseUser);

        // Load backend role

        try {
            const data = await getCurrentUser();
            console.log(
                "Logged in backend user:", data
            );

            setRole(
                data.role ?? null
            );

        } catch (error) {
            console.error(
                "Failed to load user role:", error
            );
            setRole(null);
        }
    }

    // Register
    async function register(
        name: string,
        email: string,
        password: string,
        role: string
    ) {

        // Step 1: Create Firebase user
        const firebaseUser =
            await registerUser(
                name, email, password
            );

        // Step 2: Create MongoDB user profile
        await createUserProfile({
            firebase_uid: firebaseUser.uid,
            name, email, role,
        });

        // Step 3: Get Firebase token
        const token = await firebaseUser.getIdToken();
        console.log(token);

        // Step 4: Store Firebase user
        setUser(firebaseUser);
        setRole( role );
    }

    async function updateUsername(
        username: string
    ) {

        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error(
                "User is not logged in"
            );
        }
        const oldUsername = currentUser.displayName ?? "";
        try {
            console.log(
                "Updating Firebase username:", username
            );

            await updateFirebaseUsername(
                username
            );
            console.log(
                "Updating MongoDB username:", username
            );
            const backendUser =
                await updateCurrentUser(
                    username
                );

            console.log(
                "Updated backend user:", backendUser
            );

            const updatedUser = auth.currentUser;

            if (!updatedUser) {
                throw new Error(
                    "Firebase user is no longer available."
                );
            }

            setUser( updatedUser );
            try {
                const latestUser = await getCurrentUser();
                setRole(
                    latestUser.role ?? null
                );
            } catch (roleError) {
                console.error(
                    "Failed to refresh backend user:", roleError
                );

            }
            console.log(
                "Username updated successfully:",
                updatedUser.displayName
            );

        } catch (error) {
            console.error(
                "Username update failed:", error
            );
            try {
                if (
                    auth.currentUser &&
                    auth.currentUser.displayName !== oldUsername
                ) {
                    await updateFirebaseUsername(
                        oldUsername
                    );
                }
            } catch (rollbackError) {
                console.error(
                    "Failed to rollback Firebase username:",
                    rollbackError
                );

            }
            throw error;
        }
    }

    // Change Password

    async function changePassword(
        currentPassword: string,
        newPassword: string
    ) {
        await changeFirebasePassword(
            currentPassword, newPassword
        );
    }

    // Get Token
    async function getToken() {
        if (!auth.currentUser) {
            throw new Error(
                "User not logged in"
            );
        }
        return await auth.currentUser.getIdToken();
    }

    // Logout

    async function logout() {
        await logoutUser();
        setUser(null);
        setRole(null);

    }

    // Provider
   
    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                role,
                login,
                register,
                updateUsername,
                changePassword,
                logout,
                getToken,
            }}
        >

            {children}
        </AuthContext.Provider>
    );
}

// useAuth
export function useAuth() {
    const context =
        useContext(
            AuthContext
        );

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }
    return context;
}