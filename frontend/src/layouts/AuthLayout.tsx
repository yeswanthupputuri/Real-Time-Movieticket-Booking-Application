import type { ReactNode } from "react";

import {
    Box,
    Paper,
    Typography,
} from "@mui/material";

interface AuthLayoutProps {
    title: string;
    children: ReactNode;
}

export default function AuthLayout({
    title, children,
}: AuthLayoutProps) {

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: "#f5f5f5",
                px: {
                    xs: 1.5, sm: 2,
                },
                py: {
                    xs: 2, sm: 4,
                },
                boxSizing: "border-box",
            }}
        >
            <Paper
                elevation={5}
                sx={{
                    width: "100%",
                    maxWidth: 420,
                    p: {
                        xs: 2.5, sm: 4,
                    },
                    borderRadius: {
                        xs: 2, sm: 3,
                    },
                    boxSizing: "border-box",
                }}
            >
                <Typography
                    component="h1"
                    variant="h4"
                    align="center"
                    sx={{
                        fontWeight: "bold",

                        fontSize: {
                            xs: "1.8rem", sm: "2.125rem",
                        },
                    }}
                    gutterBottom
                >
                    {title}
                </Typography>

                {children}
            </Paper>
        </Box>
    );
}