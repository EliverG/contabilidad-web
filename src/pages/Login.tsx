import { useState } from "react";
import {
    Button,
    Checkbox,
    FormControlLabel,
    TextField,
    Typography,
    IconButton,
    InputAdornment
} from "@mui/material";
import { Visibility, VisibilityOff, Calculate } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();


    const handleClickShowPassword = () => setShowPassword((prev) => !prev);

    const handleLogin = () => {
        navigate('/home');
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
            <div className="bg-white shadow-md rounded-lg p-8 w-[350px] flex flex-col items-center">
                {/* Icono superior */}
                <div className="bg-blue-600 rounded-full p-3 mb-4 flex justify-center items-center">
                    <Calculate className="text-white text-[30px]" />
                </div>

                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Sistema de Contabilidad
                </Typography>

                <Typography
                    variant="body2"
                    className="text-gray-600 text-center mb-6"
                >
                    Ingrese sus credenciales para acceder al sistema
                </Typography>

                {/* Usuario / Email */}
                <TextField
                    label="Usuario o Email"
                    placeholder="Ingrese su usuario o email"
                    fullWidth
                    margin="normal"
                />

                {/* Contraseña */}
                <TextField
                    label="Contraseña"
                    placeholder="Ingrese su contraseña"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    margin="normal"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleClickShowPassword} edge="end">
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <div className="flex justify-between items-center w-full mt-2 mb-4">
                    <FormControlLabel control={<Checkbox />} label="Recordarme" />
                    <Button variant="text" size="small">
                        ¿Olvidó su contraseña?
                    </Button>
                </div>

                <Button
                    variant="contained"
                    onClick={handleLogin}
                    className="mt-2 w-full transition-transform hover:scale-105"
                >
                    Iniciar Sesión
                </Button>
            </div>
        </div>
    );
}
