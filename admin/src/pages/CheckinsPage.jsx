import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { apiRequest, getErrorMessage } from "../lib/api";
import { formatDateTime } from "../utils/format";

const checkinStatusLabelMap = {
  checked_in: "Đang check-in",
  checked_out: "Đã check-out",
};

export default function CheckinsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState("");

  const [openCheckinDialog, setOpenCheckinDialog] = useState(false);
  const [openCheckoutDialog, setOpenCheckoutDialog] = useState(false);
  const [currentCheckinId, setCurrentCheckinId] = useState(null);

  const [checkinForm, setCheckinForm] = useState({ userId: "", note: "" });
  const [activeUsers, setActiveUsers] = useState([]);
  const [loadingActiveUsers, setLoadingActiveUsers] = useState(false);
  const [userSearchKeyword, setUserSearchKeyword] = useState("");
  const [checkoutNote, setCheckoutNote] = useState("");
  const [saving, setSaving] = useState(false);

  const openRows = useMemo(() => rows.filter((row) => row.status === "checked_in"), [rows]);
  const checkedInUserIdSet = useMemo(
    () => new Set(openRows.map((row) => String(row.user_id))),
    [openRows]
  );

  const fetchCheckins = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await apiRequest({ method: "GET", url: "/api/checkins?page=1&limit=100" });
      setRows(result?.data?.items || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCheckins();
  }, [fetchCheckins]);

  const fetchActiveUsers = useCallback(async () => {
    setLoadingActiveUsers(true);
    setError("");

    try {
      const result = await apiRequest({
        method: "GET",
        url: "/api/admin/users?page=1&limit=100&role=user&status=active",
      });
      setActiveUsers(result?.data?.items || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingActiveUsers(false);
    }
  }, []);

  useEffect(() => {
    if (openCheckinDialog) {
      fetchActiveUsers();
    }
  }, [openCheckinDialog, fetchActiveUsers]);

  const filteredActiveUsers = useMemo(() => {
    const keyword = userSearchKeyword.trim().toLowerCase();
    if (!keyword) return activeUsers;

    return activeUsers.filter((item) => {
      const name = String(item.name || "").toLowerCase();
      const email = String(item.email || "").toLowerCase();
      const phone = String(item.phone || "").toLowerCase();
      const id = String(item.id || "");
      return (
        name.includes(keyword) ||
        email.includes(keyword) ||
        phone.includes(keyword) ||
        id.includes(keyword)
      );
    });
  }, [activeUsers, userSearchKeyword]);

  const handleCheckin = async () => {
    if (!checkinForm.userId) {
      setError("Vui lòng nhập hoặc chọn ID hội viên trước khi check-in");
      return;
    }

    const selectedUser = activeUsers.find((item) => String(item.id) === String(checkinForm.userId));
    const selectedUserIsWaitingCheckout =
      selectedUser && checkedInUserIdSet.has(String(selectedUser.id));

    if (selectedUser && !selectedUser.active_membership_id) {
      setError("Hội viên này chưa có thẻ hội viên hiệu lực nên không thể check-in");
      return;
    }

    if (selectedUserIsWaitingCheckout) {
      setError("Hội viên này đang check-in, cần check-out trước khi tạo lượt mới");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await apiRequest({
        method: "POST",
        url: "/api/checkins/check-in",
        data: {
          userId: Number(checkinForm.userId),
          note: checkinForm.note,
        },
      });

      setOpenCheckinDialog(false);
      setCheckinForm({ userId: "", note: "" });
      setUserSearchKeyword("");
      setSnackbar("Check-in thành công");
      await fetchCheckins();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCheckout = async () => {
    if (!currentCheckinId) return;

    setSaving(true);
    setError("");

    try {
      await apiRequest({
        method: "POST",
        url: `/api/checkins/check-out/${currentCheckinId}`,
        data: { note: checkoutNote },
      });

      setOpenCheckoutDialog(false);
      setCurrentCheckinId(null);
      setCheckoutNote("");
      setSnackbar("Check-out thành công");
      await fetchCheckins();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
        <Typography variant="h5">Quản lý check-in / check-out</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={fetchCheckins}>
            Tải lại
          </Button>
          <Button
            variant="contained"
            startIcon={<LoginRoundedIcon />}
            onClick={() => {
              setOpenCheckinDialog(true);
              setUserSearchKeyword("");
            }}
          >
            Check-in
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Đang check-in: {openRows.length}
        </Typography>
      </Paper>

      <Paper sx={{ overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ minHeight: 220, display: "grid", placeItems: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Hội viên</TableCell>
                <TableCell>Check-in</TableCell>
                <TableCell>Check-out</TableCell>
                <TableCell>Nhân viên</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography color="text.secondary">Không có bản ghi check-in.</Typography>
                  </TableCell>
                </TableRow>
              )}

              {rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>{row.user_name || `Người dùng #${row.user_id}`}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      thẻ hội viên #{row.membership_id}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDateTime(row.checkin_time)}</TableCell>
                  <TableCell>{formatDateTime(row.checkout_time)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">Check-in: {row.checkin_by_name || "-"}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Check-out: {row.checkout_by_name || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={checkinStatusLabelMap[row.status] || row.status}
                      color={row.status === "checked_in" ? "primary" : "default"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {row.status === "checked_in" ? (
                      <Button
                        size="small"
                        startIcon={<LogoutRoundedIcon />}
                        onClick={() => {
                          setCurrentCheckinId(row.id);
                          setOpenCheckoutDialog(true);
                        }}
                      >
                        Check-out
                      </Button>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={openCheckinDialog} onClose={() => setOpenCheckinDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>Tạo check-in</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="ID hội viên"
              type="number"
              value={checkinForm.userId}
              onChange={(event) => setCheckinForm((prev) => ({ ...prev, userId: event.target.value }))}
              fullWidth
            />

            <TextField
              label="Tìm nhanh hội viên đang hoạt động"
              placeholder="Nhập tên, email, số điện thoại hoặc ID"
              value={userSearchKeyword}
              onChange={(event) => setUserSearchKeyword(event.target.value)}
              fullWidth
            />

            <Paper variant="outlined" sx={{ maxHeight: 280, overflow: "auto", p: 1 }}>
              {loadingActiveUsers ? (
                <Box sx={{ minHeight: 140, display: "grid", placeItems: "center" }}>
                  <CircularProgress size={24} />
                </Box>
              ) : filteredActiveUsers.length === 0 ? (
                <Box sx={{ minHeight: 80, display: "grid", placeItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Không có hội viên phù hợp.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1}>
                  {filteredActiveUsers.map((item) => {
                    const isSelected = String(checkinForm.userId) === String(item.id);
                    const hasActiveMembership = Boolean(item.active_membership_id);
                    const isWaitingCheckout = checkedInUserIdSet.has(String(item.id));
                    const canChoose = hasActiveMembership && !isWaitingCheckout;
                    const disabledReason = !hasActiveMembership
                      ? "Chưa có thẻ hội viên hiệu lực"
                      : isWaitingCheckout
                        ? "Đang check-in, cần check-out trước"
                        : "";

                    return (
                      <Paper
                        key={item.id}
                        sx={{
                          p: 1.25,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                          bgcolor: !canChoose
                            ? "rgba(88, 103, 122, 0.25)"
                            : isSelected
                              ? "rgba(34, 211, 238, 0.12)"
                              : "rgba(9, 31, 51, 0.45)",
                          border: isSelected
                            ? "1px solid rgba(34, 211, 238, 0.5)"
                            : "1px solid rgba(127, 181, 224, 0.12)",
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 600 }} noWrap>
                            #{item.id} - {item.name || "Hội viên"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {item.email} {item.phone ? `• ${item.phone}` : ""}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }} noWrap>
                            {item.active_membership_plan_name
                              ? `Gói hiện tại: ${item.active_membership_plan_name}`
                              : "Chưa có gói hội viên đang hiệu lực"}
                          </Typography>
                          {!canChoose && (
                            <Typography
                              variant="caption"
                              sx={{ display: "block", color: "warning.light", fontWeight: 600 }}
                              noWrap
                            >
                              {disabledReason}
                            </Typography>
                          )}
                        </Box>

                        <Button
                          size="small"
                          variant={isSelected ? "contained" : "outlined"}
                          disabled={!canChoose}
                          onClick={() => setCheckinForm((prev) => ({ ...prev, userId: String(item.id) }))}
                        >
                          {isSelected ? "Đã chọn" : "Chọn"}
                        </Button>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </Paper>

            <TextField
              label="Ghi chú"
              value={checkinForm.note}
              onChange={(event) => setCheckinForm((prev) => ({ ...prev, note: event.target.value }))}
              multiline
              minRows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCheckinDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCheckin} disabled={saving}>
            {saving ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCheckoutDialog} onClose={() => setOpenCheckoutDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>Check-out bản ghi #{currentCheckinId}</DialogTitle>
        <DialogContent>
          <TextField
            sx={{ mt: 1 }}
            label="Ghi chú"
            value={checkoutNote}
            onChange={(event) => setCheckoutNote(event.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCheckoutDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCheckout} disabled={saving}>
            {saving ? "Đang xử lý..." : "Check-out"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={2600}
        onClose={() => setSnackbar("")}
        message={snackbar}
      />
    </Stack>
  );
}
