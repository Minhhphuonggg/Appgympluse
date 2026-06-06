import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import CheckinsPage from "./pages/CheckinsPage";
import DashboardPage from "./pages/DashboardPage";
import EquipmentsPage from "./pages/EquipmentsPage";
import ExercisesPage from "./pages/ExercisesPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import PlansPage from "./pages/PlansPage";
import UsersPage from "./pages/UsersPage";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={["admin", "staff"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/checkins" element={<CheckinsPage />} />
          <Route path="/equipments" element={<EquipmentsPage />} />

          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/equipments" element={<EquipmentsPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={["admin", "staff"]} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
