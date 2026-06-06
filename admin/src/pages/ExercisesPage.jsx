import { useCallback, useEffect, useState } from "react";
import {
  Alert,
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

const difficultyOptions = ["easy", "medium", "hard"];
const difficultyLabelMap = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
};

const emptyForm = {
  id: null,
  name: "",
  description: "",
  muscleGroup: "",
  difficulty: "medium",
  equipment: "",
  videoUrl: "",
  thumbnail: "",
};

export default function ExercisesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await apiRequest({ method: "GET", url: "/api/exercises?page=1&limit=100" });
      setRows(result?.data?.items || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const openCreate = () => {
    setForm(emptyForm);
    setOpenDialog(true);
  };

  const openEdit = (row) => {
    setForm({
      id: row.id,
      name: row.name || "",
      description: row.description || "",
      muscleGroup: row.muscle_group || "",
      difficulty: row.difficulty || "medium",
      equipment: row.equipment || "",
      videoUrl: row.video_url || "",
      thumbnail: row.thumbnail || "",
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

      setForm((prev) => ({ ...prev, thumbnail: result?.data?.url || "" }));
      setSnackbar("Upload ảnh thành công");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const saveExercise = async () => {
    setSaving(true);
    setError("");

    try {
      const payload = {
        name: form.name,
        description: form.description,
        muscleGroup: form.muscleGroup,
        difficulty: form.difficulty,
        equipment: form.equipment,
        videoUrl: form.videoUrl,
        thumbnail: form.thumbnail,
      };

      if (form.id) {
        await apiRequest({ method: "PATCH", url: `/api/exercises/${form.id}`, data: payload });
        setSnackbar("Cập nhật bài tập thành công");
      } else {
        await apiRequest({ method: "POST", url: "/api/exercises", data: payload });
        setSnackbar("Tạo bài tập thành công");
      }

      setOpenDialog(false);
      await fetchExercises();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const removeExercise = async (id) => {
    const accepted = window.confirm("Xóa bài tập này?");
    if (!accepted) return;

    try {
      await apiRequest({ method: "DELETE", url: `/api/exercises/${id}` });
      setSnackbar("Đã xóa bài tập");
      await fetchExercises();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
        <Typography variant="h5">Quản lý bài tập</Typography>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
          Tạo bài tập
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
                <TableCell>Tên bài tập</TableCell>
                <TableCell>Nhóm cơ</TableCell>
                <TableCell>Độ khó</TableCell>
                <TableCell>Cập nhật</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary">Không có bài tập.</Typography>
                  </TableCell>
                </TableRow>
              )}

              {rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>{row.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {row.equipment || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.muscle_group || "-"}</TableCell>
                  <TableCell>{difficultyLabelMap[row.difficulty] || row.difficulty}</TableCell>
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
                        onClick={() => removeExercise(row.id)}
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>{form.id ? "Cập nhật bài tập" : "Tạo bài tập"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Tên bài tập"
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

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Nhóm cơ"
                value={form.muscleGroup}
                onChange={(event) => setForm((prev) => ({ ...prev, muscleGroup: event.target.value }))}
                fullWidth
              />
              <TextField
                label="Dụng cụ"
                value={form.equipment}
                onChange={(event) => setForm((prev) => ({ ...prev, equipment: event.target.value }))}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Độ khó</InputLabel>
                <Select
                  value={form.difficulty}
                  label="Độ khó"
                  onChange={(event) => setForm((prev) => ({ ...prev, difficulty: event.target.value }))}
                >
                  {difficultyOptions.map((difficulty) => (
                    <MenuItem key={difficulty} value={difficulty}>
                      {difficultyLabelMap[difficulty] || difficulty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Video URL"
                value={form.videoUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, videoUrl: event.target.value }))}
                fullWidth
              />
            </Stack>

            <Stack spacing={1.5}>
              <TextField
                label="Thumbnail URL"
                value={form.thumbnail}
                onChange={(event) => setForm((prev) => ({ ...prev, thumbnail: event.target.value }))}
                fullWidth
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems="center">
                <Button component="label" variant="outlined" startIcon={<UploadRoundedIcon />} disabled={uploadingImage}>
                  {uploadingImage ? "Đang upload..." : "Upload ảnh lên Cloudinary"}
                  <input type="file" hidden accept="image/*" onChange={onUploadImage} />
                </Button>
                {form.thumbnail && (
                  <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-all" }}>
                    {form.thumbnail}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={saveExercise} disabled={saving}>
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
