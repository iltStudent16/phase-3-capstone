import { Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ClaimDetailPage from "./pages/ClaimDetailPage";
import ClaimsPage from "./pages/ClaimsPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import PoliciesPage from "./pages/PoliciesPage";
import RegisterPage from "./pages/RegisterPage";

function AppLayout() {
  return (
    <div>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/claims" element={<ClaimsPage />} />
          <Route path="/claims/:id" element={<ClaimDetailPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<AppLayout />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
