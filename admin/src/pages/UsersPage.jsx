import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import { apiRequest, getErrorMessage } from "../lib/api";
import { formatDateTime, formatMoney } from "../utils/format";
import { useAuth } from "../context/AuthContext";

const roleOptions = ["admin", "staff", "user"];
const statusOptions = ["active", "banned"];

const roleLabelMap = {
  admin: "Quản trị viên",
  staff: "Nhân viên",
  user: "Hội viên",
};

const statusLabelMap = {
  active: "Đang hoạt động",
  banned: "Đã khóa",
};

const emptyUserForm = {
  id: null,
  name: "",
  email: "",
  password: "",
  phone: "",
  avatar: "",
  role: "user",
  status: "active",
};

export default function UsersPage() {
  const { user, updateUserState } = useAuth();
  const [rows, setRows] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState("");
  const [filters, setFilters] = useState({ keyword: "", role: "", status: "" });

  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [savingUser, setSavingUser] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [openMembershipDialog, setOpenMembershipDialog] = useState(false);
  const [assigningMembership, setAssigningMembership] = useState(false);
  const [membershipUser, setMembershipUser] = useState(null);
  const [membershipForm, setMembershipForm] = useState({ planId: "", price: "" });

  // ===== LOGIC PHÂN QUYỀN =====
  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff";
  
  const canManageUsers = isAdmin || isStaff; 
  const canAssignMembership = isAdmin || isStaff;

  const canModifyRow = (row) => {
    if (isAdmin) return true; 
    if (isStaff && row.role === "user") return true; 
    return false; 
  };
  // ============================

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", "100");

    if (filters.keyword.trim()) params.set("keyword", filters.keyword.trim());
    if (filters.role) params.set("role", filters.role);
    if (filters.status) params.set("status", filters.status);

    return params.toString();
  }, [filters]);

  const selectedPlan = useMemo(
    () => plans.find((item) => String(item.id) === String(membershipForm.planId)) || null,
    [plans, membershipForm.planId]
  );

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await apiRequest({ method: "GET", url: `/api/admin/users?${queryString}` });
      setRows(result?.data?.items || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  const fetchPlans = useCallback(async () => {
    if (!canAssignMembership) return;

    setLoadingPlans(true);
    try {
      const result = await apiRequest({
        method: "GET",
        url: "/api/membership-plans?page=1&limit=100&status=active",
      });
      setPlans(result?.data?.items || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingPlans(false);
    }
  }, [canAssignMembership]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    if (!openMembershipDialog) return;
    if (membershipForm.planId) return;
    if (plans.length === 0) return;

    setMembershipForm({
      planId: String(plans[0].id),
      price: String(Number(plans[0].price || 0)),
    });
  }, [openMembershipDialog, membershipForm.planId, plans]);

  const openCreateDialog = () => {
    setError("");
    setUserForm(emptyUserForm);
    setOpenUserDialog(true);
  };

  const openEditDialog = (row) => {
    setError("");
    setUserForm({
      id: row.id,
      name: row.name || "",
      email: row.email || "",
      password: "",
      phone: row.phone || "",
      avatar: row.avatar || "",
      role: row.role || "user",
      status: row.status || "active",
    });
    setOpenUserDialog(true);
  };

  const onUploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setError("");

    try {
      const data = new FormData();
      data.append("image", file);

      const result = await apiRequest({
        method: "POST",
        url: "/api/uploads/image",
        data,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUserForm((prev) => ({ ...prev, avatar: result?.data?.url || "" }));
      setSnackbar("Upload ảnh đại diện thành công");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const saveUser = async () => {
    if (userForm.phone && (userForm.phone.length !== 10 || !userForm.phone.startsWith("0"))) {
      setError("Số điện thoại không hợp lệ (Phải đủ 10 chữ số và bắt đầu bằng số 0)");
      return;
    }
    setSavingUser(true);
    setError("");

    try {
      const payload = {
        name: userForm.name,
        email: userForm.email,
        phone: userForm.phone || undefined,
        avatar: userForm.avatar || undefined,
        role: isStaff ? "user" : userForm.role,
        status: userForm.status,
      };

      if (userForm.password) {
        payload.password = userForm.password;
      }

      if (userForm.id) {
        await apiRequest({
          method: "PATCH",
          url: `/api/admin/users/${userForm.id}`,
          data: payload,
        });
        setSnackbar("Cập nhật hội viên thành công");

        if (Number(userForm.id) === Number(user?.id)) {
          updateUserState({
            name: payload.name,
            avatar: payload.avatar || "",
            role: payload.role,
          });
        }
      } else {
        await apiRequest({
          method: "POST",
          url: "/api/admin/users",
          data: payload,
        });
        setSnackbar("Tạo hội viên thành công");
      }

      setOpenUserDialog(false);
      await fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingUser(false);
    }
  };

  const removeUser = async (row) => {
    if (!canModifyRow(row)) {
      setError("Bạn không có quyền xóa tài khoản nhân viên hoặc quản trị viên.");
      return;
    }

    const accepted = window.confirm(`Bạn có chắc muốn xóa tài khoản: ${row.name}?`);
    if (!accepted) return;

    try {
      await apiRequest({ method: "DELETE", url: `/api/admin/users/${row.id}` });
      setSnackbar("Đã xóa hội viên");
      await fetchUsers();
    } catch (err) {
      setError(`Xóa không thành công`);
    }
  };

  const updateStatus = async (row, status) => {
    if (!canModifyRow(row)) return;

    try {
      await apiRequest({
        method: "PATCH",
        url: `/api/admin/users/${row.id}/status`,
        data: { status },
      });
      setSnackbar("Cập nhật trạng thái thành công");
      await fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const updateRole = async (userId, role) => {
    if (!isAdmin) return;

    try {
      await apiRequest({
        method: "PATCH",
        url: `/api/admin/users/${userId}/role`,
        data: { role },
      });
      setSnackbar("Cập nhật vai trò thành công");

      if (Number(userId) === Number(user?.id)) {
        updateUserState({ role });
      }

      await fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const openAssignMembershipDialog = async (row) => {
    setError("");
    setMembershipUser(row);

    if (plans.length === 0) {
      await fetchPlans();
    }

    const defaultPlan = plans[0];
    setMembershipForm({
      planId: defaultPlan ? String(defaultPlan.id) : "",
      price: defaultPlan ? String(Number(defaultPlan.price || 0)) : "",
    });
    setOpenMembershipDialog(true);
  };

  const onChangePlan = (nextPlanId) => {
    const nextPlan = plans.find((item) => String(item.id) === String(nextPlanId));
    setMembershipForm({
      planId: nextPlanId,
      price: nextPlan ? String(Number(nextPlan.price || 0)) : "",
    });
  };

  const assignMembership = async () => {
    if (!membershipUser) return;
    if (!membershipForm.planId) {
      setError("Vui lòng chọn gói hội viên");
      return;
    }

    setAssigningMembership(true);
    setError("");

    try {
      const payload = {
        planId: Number(membershipForm.planId),
      };

      if (membershipForm.price.trim()) {
        payload.price = Number(membershipForm.price);
      }

      await apiRequest({
        method: "POST",
        url: `/api/admin/users/${membershipUser.id}/memberships`,
        data: payload,
      });

      setSnackbar("Gắn thẻ hội viên thành công");
      setOpenMembershipDialog(false);
      await fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAssigningMembership(false);
    }
  };

  // ===== HÀM HỦY THẺ HỘI VIÊN ĐÃ ĐƯỢC THÊM VÀO =====
  const removeMembership = async (userId, membershipId) => {
    const accepted = window.confirm("Bạn có chắc chắn muốn HỦY thẻ hội viên của người này không?");
    if (!accepted) return;

    try {
      await apiRequest({
        method: "DELETE",
        url: `/api/admin/users/${userId}/memberships/${membershipId}`,
      });
      setSnackbar("Đã hủy thẻ hội viên thành công");
      await fetchUsers(); // Gọi lại API để load lại danh sách sau khi xóa
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };
  // ===============================================

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField
            size="small"
            label="Tìm kiếm"
            placeholder="Tên, email, số điện thoại"
            value={filters.keyword}
            onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))}
            fullWidth
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Vai trò</InputLabel>
            <Select
              label="Vai trò"
              value={filters.role}
              onChange={(event) => setFilters((prev) => ({ ...prev, role: event.target.value }))}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {roleOptions.map((role) => (
                <MenuItem key={role} value={role}>
                  {roleLabelMap[role] || role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              label="Trạng thái"
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {statusLabelMap[status] || status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            startIcon={<RefreshRoundedIcon />}
            variant="contained"
            onClick={fetchUsers}
            sx={{ whiteSpace: "nowrap", minWidth: 110, flexShrink: 0 }}
          >
            Tải lại
          </Button>

          {canManageUsers && (
            <Button
              startIcon={<AddRoundedIcon />}
              variant="contained"
              color="secondary"
              onClick={openCreateDialog}
              sx={{ whiteSpace: "nowrap", minWidth: 120, flexShrink: 0 }}
            >
              Thêm hội viên
            </Button>
          )}
        </Stack>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}

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
                <TableCell>Thông tin</TableCell>
                <TableCell>Gói hội viên hiện tại</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Trạng thái</TableCell>
                {canManageUsers && <TableCell align="right">Hành động</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canManageUsers ? 7 : 6}>
                    <Typography color="text.secondary">Không có dữ liệu.</Typography>
                  </TableCell>
                </TableRow>
              )}

              {rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>
                    <Stack>
                      <Typography sx={{ fontWeight: 600 }}>{row.name || "-"}</Typography>
                      <Typography variant="body2" color="text.secondary">{row.email}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.phone || "-"}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.75} alignItems="flex-start">
                      {row.active_membership_id ? (
                        <Stack spacing={0.35} sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {row.active_membership_plan_name || `Plan #${row.active_membership_plan_id}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Hết hạn: {formatDateTime(row.active_membership_end_date)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Giá: {formatMoney(row.active_membership_price)}
                          </Typography>
                          <Chip size="small" color="primary" label="Đang có hiệu lực" sx={{ width: "fit-content", mb: 0.5 }} />
                          
                          {/* NÚT HỦY THẺ HIỂN THỊ Ở ĐÂY KHI HỘI VIÊN ĐANG CÓ THẺ */}
                          {canAssignMembership && row.role === "user" && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => removeMembership(row.id, row.active_membership_id)}
                              sx={{ mt: 0.5, p: "2px 8px", fontSize: "0.75rem" }}
                            >
                              Hủy thẻ đang dùng
                            </Button>
                          )}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Chưa đăng ký gói hội viên
                        </Typography>
                      )}

                      {canAssignMembership && row.role === "user" && !row.active_membership_id && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<WorkspacePremiumRoundedIcon />}
                          onClick={() => openAssignMembershipDialog(row)}
                          sx={{ mt: 0.5 }}
                        >
                          Thêm gói hội viên
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={roleLabelMap[row.role] || row.role}
                        color={row.role === "admin" ? "secondary" : "default"}
                      />
                      {isAdmin && (
                        <FormControl size="small" sx={{ minWidth: 110 }}>
                          <Select value={row.role} onChange={(event) => updateRole(row.id, event.target.value)}>
                            {roleOptions.map((role) => (
                              <MenuItem key={role} value={role}>
                                {roleLabelMap[role] || role}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={statusLabelMap[row.status] || row.status}
                        color={row.status === "active" ? "primary" : "warning"}
                      />
                      {canModifyRow(row) && (
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select value={row.status} onChange={(event) => updateStatus(row, event.target.value)}>
                            {statusOptions.map((status) => (
                              <MenuItem key={status} value={status}>
                                {statusLabelMap[status] || status}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Stack>
                  </TableCell>
                  {canManageUsers && (
                    <TableCell align="right">
                      {canModifyRow(row) && (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button size="small" startIcon={<EditRoundedIcon />} onClick={() => openEditDialog(row)}>
                            Sửa
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteRoundedIcon />}
                            onClick={() => removeUser(row)}
                          >
                            Xóa
                          </Button>
                        </Stack>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Dialog tạo mới / chỉnh sửa thông tin thành viên */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{userForm.id ? "Cập nhật thông tin hội viên" : "Tạo hội viên mới"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Họ và tên"
              value={userForm.name}
              onChange={(event) => setUserForm((prev) => ({ ...prev, name: event.target.value }))}
              fullWidth
            />
            <TextField
              label="Email"
              value={userForm.email}
              onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))}
              fullWidth
            />
            <TextField
              label={userForm.id ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}
              type="password"
              value={userForm.password}
              onChange={(event) => setUserForm((prev) => ({ ...prev, password: event.target.value }))}
              fullWidth
            />
            <TextField
              label="Số điện thoại"
              value={userForm.phone}
              onChange={(event) => {
                const val = event.target.value.replace(/\D/g, "").slice(0, 10);
                setUserForm((prev) => ({ ...prev, phone: val }));
              }}
              fullWidth
              error={userForm.phone.length > 0 && (userForm.phone.length !== 10 || !userForm.phone.startsWith("0"))}
              helperText={
                userForm.phone.length > 0 && (userForm.phone.length !== 10 || !userForm.phone.startsWith("0"))
                  ? "Phải đủ 10 chữ số và bắt đầu bằng số 0"
                  : ""
              }
            />
            
            <Stack spacing={1.5}>
              <TextField
                label="Avatar URL"
                value={userForm.avatar}
                onChange={(event) => setUserForm((prev) => ({ ...prev, avatar: event.target.value }))}
                fullWidth
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems="center">
                <Button component="label" variant="outlined" startIcon={<UploadRoundedIcon />} disabled={uploadingAvatar}>
                  {uploadingAvatar ? "Đang upload..." : "Upload ảnh lên Cloudinary"}
                  <input type="file" hidden accept="image/*" onChange={onUploadAvatar} />
                </Button>
                
                {userForm.avatar && (
                  <Avatar
                    variant="rounded"
                    src={userForm.avatar}
                    alt="Avatar preview"
                    sx={{ width: 52, height: 52, border: "1px solid rgba(148, 193, 232, 0.25)" }}
                  />
                )}
              </Stack>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {isAdmin && (
                <FormControl fullWidth>
                  <InputLabel>Vai trò</InputLabel>
                  <Select
                    label="Vai trò"
                    value={userForm.role}
                    onChange={(event) => setUserForm((prev) => ({ ...prev, role: event.target.value }))}
                  >
                    {roleOptions.map((role) => (
                      <MenuItem key={role} value={role}>
                        {roleLabelMap[role] || role}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  label="Trạng thái"
                  value={userForm.status}
                  onChange={(event) => setUserForm((prev) => ({ ...prev, status: event.target.value }))}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {statusLabelMap[status] || status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={saveUser} disabled={savingUser}>
            {savingUser ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog cấp thẻ hội viên trực tiếp */}
      <Dialog open={openMembershipDialog} onClose={() => setOpenMembershipDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Thêm gói hội viên trực tiếp</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Hội viên"
              value={membershipUser ? `${membershipUser.name || "-"} (${membershipUser.email})` : ""}
              fullWidth
              disabled
            />
            <FormControl fullWidth>
              <InputLabel>Gói hội viên</InputLabel>
              <Select
                label="Gói hội viên"
                value={membershipForm.planId}
                onChange={(event) => onChangePlan(event.target.value)}
              >
                {plans.map((plan) => (
                  <MenuItem key={plan.id} value={String(plan.id)}>
                    {plan.name} - {formatMoney(plan.price)} / {plan.duration_days} ngày
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Giá thu (VND)"
              type="number"
              value={membershipForm.price}
              onChange={(event) => setMembershipForm((prev) => ({ ...prev, price: event.target.value }))}
              fullWidth
            />
            {selectedPlan && (
              <Typography variant="body2" color="text.secondary">
                Gói chọn: {selectedPlan.name} ({selectedPlan.duration_days} ngày)
              </Typography>
            )}
            {loadingPlans && <Typography color="text.secondary">Đang tải danh sách gói...</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMembershipDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={assignMembership} disabled={assigningMembership || loadingPlans}>
            {assigningMembership ? "Đang thêm..." : "Thêm thẻ"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={2400}
        onClose={() => setSnackbar("")}
        message={snackbar}
      />
    </Stack>
  );
}