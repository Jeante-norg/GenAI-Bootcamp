import React from "react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side — Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-10">
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">GreenAudit AI</h2>
          <p className="text-gray-500 mb-8">"Sustainability starts with one login"</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Login successful!");
            }}
          >
            <div className="mb-5">
              <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block mb-2 font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-md transition"
            >
              Login
            </button>

            <div className="text-center mt-6 text-gray-500">
              Don’t have an account?{" "}
              <a href="/signup" className="text-green-500 font-semibold hover:underline">
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
          <li><i className="fas fa-chart-line mr-2"></i> Real-time data analytics</li>
          <li><i className="fas fa-globe mr-2"></i> Global sustainability insights</li>
          <li><i className="fas fa-seedling mr-2"></i> AI-driven eco suggestions</li>
        </ul>
      </div>
    </div>
  );
}
