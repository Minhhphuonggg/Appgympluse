import { useCallback, useEffect, useState } from "react";
import {
  Alert,
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
import { formatDateTime } from "../utils/format";

const conditionOptions = ["good", "maintenance", "broken"];
const conditionLabelMap = {
  good: "Tốt",
  maintenance: "Bảo trì",
  broken: "Hỏng",
};

const emptyForm = {
  id: null,
  name: "",
  brand: "",
  quantity: "1",
  size: "",
  weightKg: "",
  imageUrl: "",
  conditionStatus: "good",
};

export default function EquipmentsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchEquipments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await apiRequest({ method: "GET", url: "/api/equipments?page=1&limit=100" });
      setRows(result?.data?.items || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipments();
  }, [fetchEquipments]);

  const openCreate = () => {
    setForm(emptyForm);
    setOpenDialog(true);
  };

  const openEdit = (row) => {
    setForm({
      id: row.id,
      name: row.name || "",
      brand: row.brand || "",
      quantity: String(row.quantity ?? "1"),
      size: row.size || "",
      weightKg: row.weight_kg == null ? "" : String(row.weight_kg),
      imageUrl: row.image_url || "",
      conditionStatus: row.condition_status || "good",
    });
    setOpenDialog(true);
  };

  const onUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
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

      setForm((prev) => ({ ...prev, imageUrl: result?.data?.url || "" }));
      setSnackbar("Upload ảnh thiết bị thành công");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const saveEquipment = async () => {
    setSaving(true);
    setError("");

    try {
      const payload = {
        name: form.name.trim(),
        brand: form.brand.trim() || null,
        quantity: Number(form.quantity),
        size: form.size.trim() || null,
        weightKg: form.weightKg === "" ? null : Number(form.weightKg),
        imageUrl: form.imageUrl.trim() || null,
        conditionStatus: form.conditionStatus,
      };

      if (form.id) {
        await apiRequest({ method: "PATCH", url: `/api/equipments/${form.id}`, data: payload });
        setSnackbar("Cập nhật thiết bị thành công");
      } else {
        await apiRequest({ method: "POST", url: "/api/equipments", data: payload });
        setSnackbar("Tạo thiết bị thành công");
      }

      setOpenDialog(false);
      await fetchEquipments();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const removeEquipment = async (id) => {
    const accepted = window.confirm("Xóa thiết bị này?");
    if (!accepted) return;

    try {
      await apiRequest({ method: "DELETE", url: `/api/equipments/${id}` });
      setSnackbar("Đã xóa thiết bị");
      await fetchEquipments();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
        <Typography variant="h5">Quản lý thiết bị</Typography>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
          Thêm thiết bị
        </Button>
      </Stack>

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
                <TableCell>Thiết bị</TableCell>
                <TableCell>Số lượng</TableCell>
                <TableCell>Kích thước</TableCell>
                <TableCell>Cân nặng</TableCell>
                <TableCell>Tình trạng</TableCell>
                <TableCell>Cập nhật</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography color="text.secondary">Không có thiết bị.</Typography>
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
                        {row.name?.charAt(0)?.toUpperCase() || "E"}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>{row.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {row.brand || "-"}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{row.quantity}</TableCell>
                  <TableCell>{row.size || "-"}</TableCell>
                  <TableCell>{row.weight_kg ? `${row.weight_kg} kg` : "-"}</TableCell>
                  <TableCell>{conditionLabelMap[row.condition_status] || row.condition_status}</TableCell>
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
                        onClick={() => removeEquipment(row.id)}
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
        <DialogTitle>{form.id ? "Cập nhật thiết bị" : "Thêm thiết bị"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Tên máy"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                fullWidth
              />
              <TextField
                label="Thương hiệu"
                value={form.brand}
                onChange={(event) => setForm((prev) => ({ ...prev, brand: event.target.value }))}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Số lượng"
                type="number"
                value={form.quantity}
                onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
                fullWidth
              />
              <TextField
                label="Kích thước"
                value={form.size}
                onChange={(event) => setForm((prev) => ({ ...prev, size: event.target.value }))}
                placeholder="Ví dụ: 180x80x140 cm"
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Cân nặng (kg)"
                type="number"
                value={form.weightKg}
                onChange={(event) => setForm((prev) => ({ ...prev, weightKg: event.target.value }))}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Tình trạng</InputLabel>
                <Select
                  label="Tình trạng"
                  value={form.conditionStatus}
                  onChange={(event) => setForm((prev) => ({ ...prev, conditionStatus: event.target.value }))}
                >
                  {conditionOptions.map((condition) => (
                    <MenuItem key={condition} value={condition}>
                      {conditionLabelMap[condition] || condition}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack spacing={1.25}>
              <TextField
                label="Ảnh thiết bị (URL)"
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
                    alt="Equipment preview"
                    sx={{ width: 52, height: 52, border: "1px solid rgba(148, 193, 232, 0.25)" }}
                  />
                )}
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={saveEquipment} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu"}
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
