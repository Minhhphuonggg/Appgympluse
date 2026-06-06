import { Paper, Stack, Typography } from "@mui/material";

export default function StatCard({ label, value, hint, icon }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.25,
        minHeight: 130,
        display: "flex",
        alignItems: "stretch",
        justifyContent: "space-between",
      }}
    >
      <Stack spacing={1}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" sx={{ lineHeight: 1.1 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      </Stack>

      <Stack
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          bgcolor: "rgba(34, 211, 238, 0.18)",
          border: "1px solid rgba(34, 211, 238, 0.3)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Stack>
    </Paper>
  );
}
