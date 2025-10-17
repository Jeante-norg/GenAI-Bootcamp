import React, { useState } from "react";
import { authAPI } from "../services/api.js";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const result = await authAPI.signup(
        formData.username,
        formData.email,
        formData.password
      );

      if (result.success) {
        // Signup successful - redirect to dashboard
        console.log("Signup successful");
        window.location.href = "/";
      } else {
        setError(result.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side — Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-10">
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Create your CarbonKind Account
          </h2>
          <p className="text-gray-500 mb-8">
            Track, reduce, and report your carbon footprints easily.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup}>
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block mb-2 font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
                placeholder="Enter your username"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block mb-2 font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block mb-2 font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
                placeholder="Create a password (min. 6 characters)"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block mb-2 font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
                placeholder="Confirm your password"
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
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            <ul className="mt-8 space-y-3 text-gray-700">
              <li className="flex items-center">
                <i className="fas fa-chart-pie text-green-500 mr-2"></i>
                Track your carbon footprint in real-time
              </li>
              <li className="flex items-center">
                <i className="fas fa-bolt text-green-500 mr-2"></i>
                Get personalized reduction recommendations
              </li>
              <li className="flex items-center">
                <i className="fas fa-file-alt text-green-500 mr-2"></i>
                Generate sustainability reports easily
              </li>
            </ul>

            <div className="text-center mt-6 text-gray-500">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-green-500 font-semibold hover:underline"
              >
                Login
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side — Illustration / Branding */}
      <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-green-500 to-blue-500 text-white w-1/2 p-10">
        <h2 className="text-3xl font-bold mb-3">
          Sustainability starts with one signup 🌱
        </h2>
        <p className="text-lg text-center mb-8 opacity-90">
          Join the CarbonKind community and start tracking your impact.
        </p>
        <ul className="text-left space-y-3 text-white/90">
          <li>
            <i className="fas fa-chart-line mr-2"></i> Real-time analytics
          </li>
          <li>
            <i className="fas fa-globe mr-2"></i> Global eco insights
          </li>
          <li>
            <i className="fas fa-seedling mr-2"></i> AI-powered sustainability
            tips
          </li>
        </ul>
      </div>
    </div>
  );
}
