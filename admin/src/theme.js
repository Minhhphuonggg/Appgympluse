import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: '"Space Grotesk", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: 0.4,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 14,
  },
  palette: {
    mode: "dark",
    primary: {
      main: "#22d3ee",
    },
    secondary: {
      main: "#ff7c54",
    },
    background: {
      default: "#071b2f",
      paper: "rgba(12, 30, 50, 0.86)",
    },
    text: {
      primary: "#eaf4ff",
      secondary: "#95b7d8",
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(122, 183, 228, 0.14)",
          backdropFilter: "blur(6px)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: "linear-gradient(180deg, rgba(8, 24, 42, 0.98), rgba(7, 20, 36, 0.98))",
          borderRight: "1px solid rgba(129, 201, 255, 0.16)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
