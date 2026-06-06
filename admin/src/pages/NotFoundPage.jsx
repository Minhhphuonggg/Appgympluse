import { Box, Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h3">404</Typography>
        <Typography color="text.secondary">Trang không tồn tại.</Typography>
        <Button component={Link} to="/dashboard" variant="contained">
          Về tổng quan
        </Button>
      </Stack>
    </Box>
  );
}
