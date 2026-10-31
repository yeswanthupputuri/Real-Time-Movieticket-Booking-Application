import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    reload,
} from "firebase/auth";

import { auth } from "../firebase/firebase";

// Register User
export async function registerUser(
    name: string,
    email: string,
    password: string
) {
    const credential =
        await createUserWithEmailAndPassword(
            auth, email, password
        );
    await updateProfile(
        credential.user,
        {
            displayName: name,
        }
    );
    return credential.user;
}

// Login User
export async function loginUser(
    email: string,
    password: string
) {
    const credential =
        await signInWithEmailAndPassword(
            auth, email, password
        );
    return credential.user;
}

// Update Username
export async function updateUsername(
    username: string
) {
    const currentUser = auth.currentUser;

    if (!currentUser) {
        throw new Error(
            "User is not logged in"
        );
    }
    await updateProfile(
        currentUser,
        {
            displayName: username,
        }
    );
    await reload(
        currentUser
    );
    return auth.currentUser;
}

// Change Password
export async function changePassword(
    currentPassword: string,
    newPassword: string
) {
    if (!auth.currentUser) {
        throw new Error(
            "User is not logged in"
        );
    }

    const user = auth.currentUser;
    if (!user.email) {
        throw new Error(
            "User email is not available"
        );
    }
    const credential =
        EmailAuthProvider.credential(
            user.email, currentPassword
        );
    await reauthenticateWithCredential(
        user, credential
    );
    await updatePassword(
        user, newPassword
    );
}

// Logout
export async function logoutUser() {
    await signOut( auth );

}