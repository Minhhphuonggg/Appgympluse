import { useMemo, useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import PrecisionManufacturingRoundedIcon from "@mui/icons-material/PrecisionManufacturingRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const drawerWidth = 270;

function getNavItems(role) {
  const common = [
    { label: "Tổng quan", path: "/dashboard", icon: <DashboardRoundedIcon /> },
    { label: "Gói hội viên", path: "/plans", icon: <WorkspacePremiumRoundedIcon /> },
    { label: "Bài tập", path: "/exercises", icon: <FitnessCenterRoundedIcon /> },
    { label: "Check-in / Check-out", path: "/checkins", icon: <LoginRoundedIcon /> },
  ];

  if (role === "admin") {
    return [
      { label: "Hội viên", path: "/users", icon: <GroupRoundedIcon /> },
      { label: "Thiết bị", path: "/equipments", icon: <PrecisionManufacturingRoundedIcon /> },
      ...common,
    ];
  }

  if (role === "staff") {
    return [{ label: "Hội viên", path: "/users", icon: <GroupRoundedIcon /> },
      { label: "Thiết bị", path: "/equipments", icon: <PrecisionManufacturingRoundedIcon /> }, ...common];
  }

  return common;
}

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(() => getNavItems(user?.role), [user?.role]);

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Stack spacing={1} sx={{ p: 2.5, pb: 2 }}>
        <Typography variant="h6">PulseGym Admin</Typography>
        <Typography variant="body2" color="text.secondary">
          Trung tâm điều hành cho nhân sự phòng gym
        </Typography>
      </Stack>

      <Divider sx={{ borderColor: "rgba(157, 200, 235, 0.15)" }} />

      <List sx={{ px: 1.25, py: 1.5, flexGrow: 1 }}>
        {navItems.map((item) => {
          const selected = location.pathname.startsWith(item.path);

          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              selected={selected}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": {
                  backgroundColor: "rgba(34, 211, 238, 0.14)",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "rgba(157, 200, 235, 0.15)" }} />

      <Stack spacing={1.25} sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Đăng nhập với vai trò
        </Typography>
        <Chip
          label={user?.role === "admin" ? "Quản trị viên" : "Nhân viên"}
          color={user?.role === "admin" ? "secondary" : "primary"}
          variant="outlined"
          sx={{ alignSelf: "flex-start", fontWeight: 700 }}
        />
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: "rgba(7, 24, 41, 0.72)",
          borderBottom: "1px solid rgba(129, 201, 255, 0.16)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen((prev) => !prev)}
            sx={{ mr: 1, display: { md: "none" } }}
          >
            <MenuRoundedIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">{navItems.find((item) => location.pathname.startsWith(item.path))?.label || "Tổng quan"}</Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Stack alignItems="flex-end" sx={{ display: { xs: "none", sm: "flex" } }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.name || "-"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email || ""}
              </Typography>
            </Stack>
            <Avatar sx={{ bgcolor: "rgba(255, 124, 84, 0.28)", color: "#ffd6c8" }}>
              {(user?.name || "U").charAt(0).toUpperCase()}
            </Avatar>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Đăng xuất
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          p: { xs: 2, sm: 3 },
          pt: { xs: 10, sm: 11 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
