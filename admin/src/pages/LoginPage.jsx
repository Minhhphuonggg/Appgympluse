import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../lib/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "admin@gym.local",
    password: "123456",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      await login(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: 2,
        display: "grid",
        placeItems: "center",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 460,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
        }}
      >
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: "rgba(34, 211, 238, 0.18)",
                display: "grid",
                placeItems: "center",
                border: "1px solid rgba(34, 211, 238, 0.3)",
              }}
            >
              <FitnessCenterRoundedIcon color="primary" />
            </Box>
            <Box>
              <Typography variant="h5">Cổng quản trị phòng gym</Typography>
              <Typography variant="body2" color="text.secondary">
                Dùng cho tài khoản admin và staff
              </Typography>
            </Box>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
              fullWidth
            />

            <TextField
              label="Mật khẩu"
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required
              fullWidth
            />

            <Button type="submit" variant="contained" size="large" disabled={loading}>
              {loading ? <CircularProgress size={22} color="inherit" /> : "Đăng nhập"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
