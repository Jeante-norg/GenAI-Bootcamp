import React, { useState } from "react";
import { authAPI } from "../services/api.js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const result = await authAPI.login(email, password);

      if (result.success) {
        // Login successful - redirect to dashboard
        console.log("Login successful:", result.data);
        window.location.href = "/";
      } else {
        setError(result.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side — Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-10">
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">CarbonKind</h2>
          <p className="text-gray-500 mb-8">
            "Sustainability starts with one login"
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block mb-2 font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="block mb-2 font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${
                loading
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              } text-white font-semibold py-3 rounded-md transition`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="text-center mt-4">
              <a
                href="#"
                className="text-green-500 text-sm hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Password reset feature coming soon!");
                }}
              >
                Forgot your password?
              </a>
            </div>

            <div className="text-center mt-6 text-gray-500">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-green-500 font-semibold hover:underline"
              >
                Sign Up
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side — Illustration / Branding */}
      <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-green-500 to-blue-500 text-white w-1/2 p-10">
        <h2 className="text-3xl font-bold mb-3">
          Sustainability starts with one login 🌿
        </h2>
        <p className="text-lg text-center mb-8 opacity-90">
          Track, reduce, and report your carbon footprints easily.
        </p>
        <ul className="text-left space-y-3 text-white/90">
          <li className="flex items-center">
            <i className="fas fa-chart-line mr-2"></i> Real-time data analytics
          </li>
          <li className="flex items-center">
            <i className="fas fa-globe mr-2"></i> Global sustainability insights
          </li>
          <li className="flex items-center">
            <i className="fas fa-seedling mr-2"></i> AI-driven eco suggestions
          </li>
        </ul>
      </div>
    </div>
  );
}
