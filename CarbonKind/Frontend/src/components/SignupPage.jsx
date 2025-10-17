import React from "react";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side — Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-10">
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Create your GreenAudit Account
          </h2>
          <p className="text-gray-500 mb-8">
            Track, reduce, and report your carbon footprints easily.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Account created successfully!");
            }}
          >
            <div className="mb-4">
              <label htmlFor="name" className="block mb-2 font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
                placeholder="Enter your full name"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="signup-email" className="block mb-2 font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="signup-email"
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="signup-password" className="block mb-2 font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="signup-password"
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
                placeholder="Create a password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-md transition"
            >
              Sign Up
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
              <a href="/login" className="text-green-500 font-semibold hover:underline">
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
          Join the GreenAudit AI community and start tracking your impact.
        </p>
        <ul className="text-left space-y-3 text-white/90">
          <li><i className="fas fa-chart-line mr-2"></i> Real-time analytics</li>
          <li><i className="fas fa-globe mr-2"></i> Global eco insights</li>
          <li><i className="fas fa-seedling mr-2"></i> AI-powered sustainability tips</li>
        </ul>
      </div>
    </div>
  );
}
