import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/requests" className="font-semibold text-gray-900">
          Client Request Desk
        </Link>
        {user && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              {user.name} ·{" "}
              <span className="text-gray-400">{user.workspace?.name}</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:bg-gray-100 px-3 py-1 rounded transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}