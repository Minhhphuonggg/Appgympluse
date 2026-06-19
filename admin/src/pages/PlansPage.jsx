import { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
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
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import { apiRequest, getErrorMessage } from "../lib/api";
import { formatDateTime, formatMoney } from "../utils/format";

const emptyForm = {
  id: null,
  name: "",
  description: "",
  imageUrl: "",
  price: "",
  durationDays: "30",
  status: "active",
};
const statusLabelMap = {
  active: "Đang hoạt động",
  inactive: "Ngưng hoạt động",
};

export default function PlansPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // State quản lý thông báo
  const [snackbar, setSnackbar] = useState("");

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiRequest({ method: "GET", url: "/api/membership-plans?page=1&limit=100" });
      setRows(result?.data?.items || []);
    } catch (err) {
      setSnackbar(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const openCreate = () => {
    setForm(emptyForm);
    setOpenDialog(true);
  };

  const openEdit = (row) => {
    setForm({
      id: row.id,
      name: row.name || "",
      description: row.description || "",
      imageUrl: row.image_url || "",
      price: String(row.price || ""),
      durationDays: String(row.duration_days || "30"),
      status: row.status || "active",
    });
    setOpenDialog(true);
  };

  const savePlan = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        imageUrl: form.imageUrl,
        price: Number(form.price),
        durationDays: Number(form.durationDays),
        status: form.status,
      };

      if (form.id) {
        await apiRequest({ method: "PATCH", url: `/api/membership-plans/${form.id}`, data: payload });
        setSnackbar("Cập nhật gói thành công");
      } else {
        await apiRequest({ method: "POST", url: "/api/membership-plans", data: payload });
        setSnackbar("Tạo gói thành công");
      }

      setOpenDialog(false);
      await fetchPlans();
    } catch (err) {
      setSnackbar(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      const data = new FormData();
      data.append("image", file);

      const result = await apiRequest({
        method: "POST",
        url: "/api/uploads/image",
        data,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm((prev) => ({ ...prev, imageUrl: result?.data?.url || "" }));
      setSnackbar("Upload ảnh gói hội viên thành công");
    } catch (err) {
      setSnackbar(getErrorMessage(err));
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const removePlan = async (id) => {
    const accepted = window.confirm("Xóa gói hội viên này?");
    if (!accepted) return;
    try {
      await apiRequest({ method: "DELETE", url: `/api/membership-plans/${id}` });
      setSnackbar("Đã xóa gói hội viên thành công");
      await fetchPlans();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setSnackbar(`Xóa không thành công`);
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
        <Typography variant="h5">Quản lý thẻ hội viên</Typography>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
          Tạo gói mới
        </Button>
      </Stack>

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
                <TableCell>Tên gói</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Thời hạn</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Cập nhật</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography color="text.secondary">Không có gói hội viên.</Typography>
                  </TableCell>
                </TableRow>
              )}

              {rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                      <Avatar
                        variant="rounded"
                        src={row.image_url || ""}
                        alt={row.name}
                        sx={{ width: 52, height: 52, border: "1px solid rgba(148, 193, 232, 0.25)" }}
                      >
                        {row.name?.charAt(0)?.toUpperCase() || "P"}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>{row.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {row.description || "-"}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{formatMoney(row.price)}</TableCell>
                  <TableCell>{row.duration_days} ngày</TableCell>
                  <TableCell>{statusLabelMap[row.status] || row.status}</TableCell>
                  <TableCell>{formatDateTime(row.updated_at)}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" startIcon={<EditRoundedIcon />} onClick={() => openEdit(row)}>
                        Sửa
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteRoundedIcon />}
                        onClick={() => removePlan(row.id)}
                      >
                        Xóa
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{form.id ? "Cập nhật gói hội viên" : "Tạo gói hội viên"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Tên gói"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              fullWidth
            />
            <TextField
              label="Mô tả"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />

            <Stack spacing={1.25}>
              <TextField
                label="Ảnh gói (URL)"
                value={form.imageUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                fullWidth
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems="center">
                <Button component="label" variant="outlined" startIcon={<UploadRoundedIcon />} disabled={uploadingImage}>
                  {uploadingImage ? "Đang upload..." : "Upload ảnh lên Cloudinary"}
                  <input type="file" hidden accept="image/*" onChange={onUploadImage} />
                </Button>
                {form.imageUrl && (
                  <Avatar
                    variant="rounded"
                    src={form.imageUrl}
                    alt="Membership plan preview"
                    sx={{ width: 52, height: 52, border: "1px solid rgba(148, 193, 232, 0.25)" }}
                  />
                )}
              </Stack>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Giá"
                type="number"
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                fullWidth
              />
              <TextField
                label="Số ngày"
                type="number"
                value={form.durationDays}
                onChange={(event) => setForm((prev) => ({ ...prev, durationDays: event.target.value }))}
                fullWidth
              />
            </Stack>
            <FormControl>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                label="Trạng thái"
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              >
                <MenuItem value="active">{statusLabelMap.active}</MenuItem>
                <MenuItem value="inactive">{statusLabelMap.inactive}</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={savePlan} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Thông báo nền trắng, chữ đen, đổ bóng nhẹ */}
      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={3000}
        onClose={() => setSnackbar("")}
        message={snackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        ContentProps={{
          sx: {
            bgcolor: "#ffffff",
            color: "#000000",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)", // Đổ bóng cho thông báo nổi lên
            fontWeight: 500,
          }
        }}
      />
    </Stack>
  );
}