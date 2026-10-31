import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";

export default function MainLayout() {
    return (

        <Box
            sx={{
                minHeight: "100vh",
                width: "100%",
                overflowX: "hidden",
            }}
        >
            <Navbar />
            <Box
                component="main"
                sx={{
                    width: "100%",
                    maxWidth: "1400px",
                    mx: "auto",
                    px: { xs: 1.5, sm: 2, md: 3, lg: 4,},

                    py: { xs: 2, sm: 3, md: 4, },

                    boxSizing: "border-box",
                }}
            >

                <Outlet />
            </Box>
        </Box>
    );

}