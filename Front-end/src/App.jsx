import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./organisms/Navbar";
import LoginPage from "./pages/LoginPage";
import RequestListPage from "./pages/RequestListPage";
import RequestCreatePage from "./pages/RequestCreatePage";
import RequestDetailPage from "./pages/RequestDetailPage";

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/requests" replace /> : <LoginPage />}
        />
        <Route
          path="/requests"
          element={
            <ProtectedLayout>
              <RequestListPage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/requests/new"
          element={
            <ProtectedLayout>
              <RequestCreatePage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/requests/:id"
          element={
            <ProtectedLayout>
              <RequestDetailPage />
            </ProtectedLayout>
          }
        />
        <Route path="/" element={<Navigate to="/requests" replace />} />
      </Routes>
    </BrowserRouter>
  );
}