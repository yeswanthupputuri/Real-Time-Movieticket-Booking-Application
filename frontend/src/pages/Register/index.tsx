import { useState } from "react";
import {
    Button,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../../layouts/AuthLayout";
import CustomTextField from "../../components/CustomTextField";
import { useAuth } from "../../contexts/AuthContext";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("USER");

    const navigate = useNavigate();
    const { register } = useAuth();

    async function handleRegister() {
        try {
            await register(
                name,
                email,
                password,
                role
            );

            navigate("/home");
        } catch (error: any) {
            console.error("Firebase Error:", error);
        }
    }

    return (
        <AuthLayout title="Register">
            <CustomTextField
                label="Name"
                value={name}
                onChange={setName}
            />

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

            <FormControl
                fullWidth
                margin="normal"
            >
                <InputLabel>Role</InputLabel>

                <Select
                    value={role}
                    label="Role"
                    onChange={(e: SelectChangeEvent) =>
                        setRole(e.target.value)
                    }
                >
                    <MenuItem value="USER">
                        User
                    </MenuItem>

                    <MenuItem value="ADMIN">
                        Admin
                    </MenuItem>
                </Select>
            </FormControl>

            <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleRegister}
            >
                Register
            </Button>

            <Typography
                align="center"
                sx={{ mt: 2 }}
            >
                Already have an account?{" "}
                <Link to="/">
                    Login
                </Link>
            </Typography>
        </AuthLayout>
    );
}