import React, { useState, useEffect } from "react";
import { userAPI, authAPI } from "../services/api.js";

function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Profile state
  const [profile, setProfile] = useState({
    id: "",
    username: "",
    email: "",
  });

  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // App preferences state
  const [preferences, setPreferences] = useState({
    measurementUnit: "metric",
    carbonDisplay: "kg",
    notifications: true,
    weeklyReports: false,
  });

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const result = await userAPI.getProfile();
        if (result.success) {
          setProfile({
            id: result.data.id,
            username: result.data.username,
            email: result.data.email,
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        setMessage({ type: "error", text: "Failed to load profile data" });
      }
    };

    loadProfile();

    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem("carbonKindPreferences");
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await userAPI.updateProfile(
        profile.id,
        profile.username,
        profile.email
      );

      if (result.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        // Refresh the page to show updated username in navbar
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage({
          type: "error",
          text: result.message || "Failed to update profile",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setLoading(false);
      return;
    }

    if (passwords.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters",
      });
      setLoading(false);
      return;
    }

    try {
      const result = await userAPI.updatePassword(
        passwords.currentPassword,
        passwords.newPassword
      );

      if (result.success) {
        setMessage({ type: "success", text: "Password updated successfully!" });
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setMessage({
          type: "error",
          text: result.message || "Failed to update password",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Save preferences to localStorage
      localStorage.setItem(
        "carbonKindPreferences",
        JSON.stringify(preferences)
      );
      setMessage({ type: "success", text: "Preferences saved successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleExportAllData = async () => {
    try {
      const url = "http://localhost:8000/export/export?format=csv";
      const link = document.createElement("a");
      link.href = url;
      link.download = true;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setMessage({ type: "success", text: "Data export started!" });
    } catch (error) {
      setMessage({ type: "error", text: "Export failed: " + error.message });
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
      )
    ) {
      if (
        window.confirm(
          "This will permanently delete ALL your carbon footprint data. Type 'DELETE' to confirm:"
        )
      ) {
        const confirmation = prompt(
          "Please type DELETE to confirm account deletion:"
        );
        if (confirmation === "DELETE") {
          setLoading(true);
          try {
            // Note: You'll need to implement deleteAccount in userAPI
            // For now, we'll show a message
            setMessage({
              type: "success",
              text: "Account deletion feature coming soon. Please contact support.",
            });
            setLoading(false);
          } catch (error) {
            setMessage({ type: "error", text: error.message });
            setLoading(false);
          }
        } else {
          setMessage({ type: "error", text: "Account deletion cancelled." });
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account preferences and data
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: "profile", name: "Profile", icon: "👤" },
                { id: "password", name: "Password", icon: "🔒" },
                { id: "preferences", name: "Preferences", icon: "⚙️" },
                { id: "data", name: "Data Management", icon: "💾" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-b-2 border-green-500 text-green-600 bg-green-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="block text-lg mb-1">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <h2 className="text-xl font-semibold text-green-800 mb-4">
                  Profile Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) =>
                        setProfile({ ...profile, username: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-3 rounded-md font-semibold ${
                      loading
                        ? "bg-green-400 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600"
                    } text-white transition-colors`}
                  >
                    {loading ? "Updating..." : "Update Profile"}
                  </button>
                </div>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <h2 className="text-xl font-semibold text-green-800 mb-4">
                  Change Password
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwords.currentPassword}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwords.newPassword}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwords.confirmPassword}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-3 rounded-md font-semibold ${
                      loading
                        ? "bg-green-400 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600"
                    } text-white transition-colors`}
                  >
                    {loading ? "Updating..." : "Change Password"}
                  </button>
                </div>
              </form>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <form onSubmit={handlePreferencesSave} className="space-y-6">
                <h2 className="text-xl font-semibold text-green-800 mb-4">
                  Application Preferences
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Measurement Units
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setPreferences({
                            ...preferences,
                            measurementUnit: "metric",
                          })
                        }
                        className={`p-4 rounded-lg border-2 text-center transition-colors ${
                          preferences.measurementUnit === "metric"
                            ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        🌍 Metric System
                        <div className="text-sm mt-1">kg, km, kWh</div>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPreferences({
                            ...preferences,
                            measurementUnit: "imperial",
                          })
                        }
                        className={`p-4 rounded-lg border-2 text-center transition-colors ${
                          preferences.measurementUnit === "imperial"
                            ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        🇺🇸 Imperial System
                        <div className="text-sm mt-1">lbs, miles, gallons</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Carbon Display
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setPreferences({
                            ...preferences,
                            carbonDisplay: "kg",
                          })
                        }
                        className={`p-4 rounded-lg border-2 text-center transition-colors ${
                          preferences.carbonDisplay === "kg"
                            ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Kilograms (kg)
                        <div className="text-sm mt-1">Standard unit</div>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPreferences({
                            ...preferences,
                            carbonDisplay: "tons",
                          })
                        }
                        className={`p-4 rounded-lg border-2 text-center transition-colors ${
                          preferences.carbonDisplay === "tons"
                            ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Metric Tons
                        <div className="text-sm mt-1">For larger amounts</div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.notifications}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            notifications: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 text-green-500 focus:ring-green-400 mr-3"
                      />
                      <span className="text-gray-700">
                        Enable email notifications
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.weeklyReports}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            weeklyReports: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 text-green-500 focus:ring-green-400 mr-3"
                      />
                      <span className="text-gray-700">
                        Send weekly progress reports
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-3 rounded-md font-semibold ${
                      loading
                        ? "bg-green-400 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600"
                    } text-white transition-colors`}
                  >
                    {loading ? "Saving..." : "Save Preferences"}
                  </button>
                </div>
              </form>
            )}

            {/* Data Management Tab */}
            {activeTab === "data" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-green-800 mb-4">
                  Data Management
                </h2>

                <div className="space-y-6">
                  {/* Export Data */}
                  <div className="p-6 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Export Your Data
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Download all your carbon footprint data in various formats
                      for analysis or backup.
                    </p>
                    <button
                      onClick={handleExportAllData}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-md transition-colors"
                    >
                      Export All Data
                    </button>
                  </div>

                  {/* Delete Account */}
                  <div className="p-6 border border-red-200 rounded-lg bg-red-50">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                      Danger Zone
                    </h3>
                    <p className="text-red-700 mb-4">
                      Permanently delete your account and all associated data.
                      This action cannot be undone.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-md transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
                    >
                      {loading ? "Deleting..." : "Delete Account"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-6 text-center">
          <button
            onClick={() => window.history.back()}
            className="text-green-600 hover:text-green-700 font-semibold"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
