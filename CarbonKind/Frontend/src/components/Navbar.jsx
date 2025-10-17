import React from "react";

function Navbar() {
  // Navigation links with active state
  const links = [
    { name: "Dashboard", active: true, redirect: "/" },
    { name: "Insights", active: false },
    { name: "Settings", active: false },
    {name: "Profile", active: false,redirect:"/login"},
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-6 py-4">
        {/* Logo */}
        <div className="text-2xl font-bold text-green-800">
          GreenAudit <span className="text-green-500">AI</span>
        </div>

        {/* Navigation */}
        <nav className="mt-3 md:mt-0">
          <ul className="flex space-x-6 text-base">
            {links.map((link) => (
              <li key={link.name}>
                <a
                  href={link.redirect ? link.redirect : "#"}
                  className={`transition-colors ${
                    link.active
                      ? "text-green-700 font-semibold border-b-2 border-green-700 pb-1"
                      : "text-gray-600 hover:text-green-700"
                  }`}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
