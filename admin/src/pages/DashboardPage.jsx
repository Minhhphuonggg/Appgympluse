import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Chip,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import EngineeringRoundedIcon from "@mui/icons-material/PrecisionManufacturingRounded"; 
import { BarChart } from "@mui/x-charts/BarChart";
import StatCard from "../components/StatCard";
import { apiRequest, getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { formatDateTime } from "../utils/format";

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    users: 0,
    plans: 0,
    exercises: 0,
    openCheckins: 0,
    equipments: 0, 
  });
  const [latestCheckins, setLatestCheckins] = useState([]);

  // Tạo một biến kiểm tra xem user hiện tại có quyền xem dữ liệu hội viên hay không (admin hoặc staff)
  const canViewUsers = user?.role === "admin" || user?.role === "staff";

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        // Cập nhật điều kiện gọi API: Nếu là admin hoặc staff thì đều gọi API lấy thông tin người dùng
        const [planRes, exerciseRes, checkinRes, userRes, equipmentRes] = await Promise.all([
          apiRequest({ method: "GET", url: "/api/membership-plans?page=1&limit=100" }),
          apiRequest({ method: "GET", url: "/api/exercises?page=1&limit=100" }),
          apiRequest({ method: "GET", url: "/api/checkins?page=1&limit=20" }),
          canViewUsers
            ? apiRequest({ method: "GET", url: "/api/admin/users?page=1&limit=100" })
            : Promise.resolve(null),
          apiRequest({ method: "GET", url: "/api/equipments?page=1&limit=100" }), 
        ]);

        const checkins = checkinRes?.data?.items || [];
        const openCheckins = checkins.filter((item) => item.status === "checked_in").length;

        const equipmentsData = equipmentRes?.data?.items || [];
        const totalEquipments = equipmentsData.reduce((sum, item) => {
          return sum + (Number(item.quantity) || 0);
        }, 0);

        setStats({
          users: userRes?.data?.pagination?.total || 0,
          plans: planRes?.data?.pagination?.total || 0,
          exercises: exerciseRes?.data?.pagination?.total || 0,
          openCheckins,
          equipments: totalEquipments, 
        });

        setLatestCheckins(checkins.slice(0, 8));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user?.role, canViewUsers]); // Thêm canViewUsers vào dependency array

  const chartData = useMemo(
    () => [
      { label: "Thẻ", value: stats.plans },
      { label: "Bài tập", value: stats.exercises },
      { label: "Thiết bị", value: stats.equipments }, 
      { label: "Đang check-in", value: stats.openCheckins },
      ...(canViewUsers ? [{ label: "Người dùng", value: stats.users }] : []), // Cập nhật hiển thị trên biểu đồ cho cả staff
    ],
    [stats, canViewUsers]
  );

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: 320 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={2.5}>
      {error && <Alert severity="error">{error}</Alert>}

      {/* Grid thống kê tổng quan */}
      <Grid2 container spacing={2}>
        {/* Cập nhật điều kiện hiển thị ô Thống kê người dùng cho cả staff */}
        {canViewUsers && (
          <Grid2 size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard label="Người dùng" value={stats.users} hint="Toàn bộ tài khoản" icon={<GroupRoundedIcon color="primary" />} />
          </Grid2>
        )}

        {/* Cập nhật tỉ lệ độ rộng ô (Grid size) dựa theo quyền để giao diện luôn cân đối */}
        <Grid2 size={{ xs: 12, sm: 6, lg: canViewUsers ? 2.4 : 3 }}>
          <StatCard
            label="Thẻ hội viên"
            value={stats.plans}
            hint="Tổng gói đang có"
            icon={<WorkspacePremiumRoundedIcon color="primary" />}
          />
        </Grid2>
        
        <Grid2 size={{ xs: 12, sm: 6, lg: canViewUsers ? 2.4 : 3 }}>
          <StatCard
            label="Bài tập"
            value={stats.exercises}
            hint="Thư viện hướng dẫn"
            icon={<FitnessCenterRoundedIcon color="primary" />}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, lg: canViewUsers ? 2.4 : 3 }}>
          <StatCard
            label="Tổng thiết bị"
            value={stats.equipments}
            hint="Vật tư tại phòng"
            icon={<EngineeringRoundedIcon color="primary" />}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, lg: canViewUsers ? 2.4 : 3 }}>
          <StatCard
            label="Đang check-in"
            value={stats.openCheckins}
            hint="Cần check-out cuối buổi"
            icon={<LoginRoundedIcon color="primary" />}
          />
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Tổng quan hôm nay
            </Typography>
            <BarChart
              height={280}
              xAxis={[{ scaleType: "band", data: chartData.map((item) => item.label) }]}
              series={[{ data: chartData.map((item) => item.value), color: "#22d3ee" }]}
            />
          </Paper>
        </Grid2>

        <Grid2 size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Check-in gần đây
            </Typography>
            <Stack spacing={1}>
              {latestCheckins.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Chưa có dữ liệu check-in.
                </Typography>
              )}

              {latestCheckins.map((item) => (
                <Paper
                  key={item.id}
                  sx={{
                    px: 1.5,
                    py: 1.25,
                    bgcolor: "rgba(10, 34, 56, 0.5)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.user_name || `Người dùng #${item.user_id}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(item.checkin_time)}
                    </Typography>
                  </Box>

                  <Chip
                    size="small"
                    label={item.status === "checked_in" ? "Đang ở phòng tập" : "Đã check-out"}
                    color={item.status === "checked_in" ? "primary" : "default"}
                  />
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid2>
      </Grid2>
    </Stack>
  );
}