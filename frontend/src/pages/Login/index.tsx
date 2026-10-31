import { useState } from "react";
import { Button, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import CustomTextField from "../../components/CustomTextField";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();
    
    async function handleLogin() {
        try {
            await login(email, password);

            navigate("/home");
        } catch (error) {
            console.error(error);

            alert("Invalid email or password");
        }
    }

    return (
        <AuthLayout title="Login">
            <CustomTextField
                label="Email"
                value={email}
                onChange={setEmail}
            />

            <CustomTextField
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
            />

            <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleLogin}
            >
                Login
            </Button>

            <Typography
                align="center"
                sx={{ mt: 2 }}
            >
                Don't have an account?{" "}
                <Link to="/register">
                    Register
                </Link>
            </Typography>
        </AuthLayout>
    );
}