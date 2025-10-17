import React, { useState, useEffect } from "react";
import { authAPI, checkAuth } from "../services/api.js";

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const authenticated = await checkAuth();
        setIsAuthenticated(authenticated);

        // In a real app, you'd fetch user profile here
        // For now, we'll just set a mock user
        if (authenticated) {
          setUser({ username: "User" });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setIsAuthenticated(false);
      setUser(null);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout anyway
      window.location.href = "/login";
    }
  };

  // Navigation links with auth state
  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { name: "Login", active: false, redirect: "/login" },
        { name: "Sign Up", active: false, redirect: "/signup" },
      ];
    }

    return [
      {
        name: "Dashboard",
        active: window.location.pathname === "/",
        redirect: "/",
      },
      {
        name: "Insights",
        active: window.location.pathname === "/report",
        redirect: "/report",
      },
      {
        name: "Settings",
        active: window.location.pathname === "/settings",
        redirect: "/settings",
      },
      {
        name: user ? `Hello, ${user.username}` : "Profile",
        active: false,
        redirect: "#",
        isUser: true,
      },
      {
        name: "Logout",
        active: false,
        redirect: "#",
        isLogout: true,
        onClick: handleLogout,
      },
    ];
  };

  const links = getNavLinks();

  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="text-2xl font-bold text-green-800">
            Carbon<span className="text-green-500">Kind</span>
          </div>
          <div className="text-gray-500">Loading...</div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-6 py-4">
        {/* Logo */}
        <div className="text-2xl font-bold text-green-800">
          Carbon<span className="text-green-500">Kind</span>
        </div>

        {/* Navigation */}
        <nav className="mt-3 md:mt-0">
          <ul className="flex flex-wrap justify-center gap-4 md:gap-6 text-base">
            {links.map((link) => (
              <li key={link.name}>
                {link.isLogout ? (
                  <button
                    onClick={link.onClick}
                    className="text-gray-600 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    {link.name}
                  </button>
                ) : link.isUser ? (
                  <span className="text-green-700 font-medium border-2 border-green-200 px-3 py-1 rounded-full">
                    {link.name}
                  </span>
                ) : (
                  <a
                    href={link.redirect}
                    className={`transition-colors ${
                      link.active
                        ? "text-green-700 font-semibold border-b-2 border-green-700 pb-1"
                        : "text-gray-600 hover:text-green-700"
                    }`}
                  >
                    {link.name}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
