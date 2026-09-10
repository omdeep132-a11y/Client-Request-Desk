import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SEEDED_USERS = [
  "alice@acme.test",
  "bob@bright.test",
  "carol@coastal.test",
  "dave@summit.test",
  "erin@metro.test",
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(SEEDED_USERS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email);
      navigate("/requests");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative gradient orbs - responsive sizes */}
      <div className="absolute top-10 -right-20 sm:top-20 sm:right-10 w-72 h-72 sm:w-96 sm:h-96 bg-cyan-500/15 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute -bottom-20 -left-20 sm:bottom-10 sm:left-20 w-64 h-64 sm:w-80 sm:h-80 bg-amber-500/10 rounded-full blur-3xl -z-10 animate-pulse" style={{animationDelay: "1s"}}></div>
      <div className="absolute top-1/2 left-1/3 w-48 h-48 sm:w-72 sm:h-72 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md">
        {/* Card - responsive padding */}
        <div className="bg-gradient-to-br from-white/98 to-slate-50/98 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/40">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 mb-3 sm:mb-4 shadow-lg shadow-blue-500/30">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent tracking-tight">
              Request Desk
            </h1>
            <p className="text-slate-600 mt-2 text-xs sm:text-sm font-medium leading-relaxed">
              Enter as any team member to view and manage requests
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* User Select */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-semibold text-slate-900"
              >
                Team member
              </label>
              <select
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/10 cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzA4NjBkOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] bg-no-repeat bg-right-4 bg-center pr-10"
              >
                {SEEDED_USERS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <p className="text-xs text-blue-600 font-semibold">
                <span className="text-slate-500">Logged in as </span>
                {email.split("@")[0]}
                <span className="text-slate-500"> • {email.split("@")[1]}</span>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-2.5 sm:p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                <div className="flex gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs sm:text-sm text-amber-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white font-semibold text-sm sm:text-sm rounded-lg hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200 shadow-lg shadow-blue-500/40 hover:shadow-blue-600/50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-blue-100">
            <p className="text-xs text-slate-600 text-center font-medium leading-relaxed">
              Demo environment • Select any team member to continue
            </p>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs text-blue-200/60">
            Client Request Desk • Premium Edition
          </p>
        </div>
      </div>
    </div>
  );
}
