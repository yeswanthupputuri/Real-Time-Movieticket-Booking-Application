import { TextField } from "@mui/material";

interface CustomTextFieldProps {
    label: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
}

export default function CustomTextField({
    label,
    type = "text",
    value,
    onChange,
}: CustomTextFieldProps) {
    return (
        <TextField
            fullWidth
            margin="normal"
            label={label}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}