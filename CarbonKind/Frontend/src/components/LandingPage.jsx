import React from "react";

function LandingPage() {
  return (
    // Full-screen light background
    <div className="bg-gray-50 min-h-screen w-full flex justify-center">
      {/* Centered content container */}
      <div className="w-full max-w-7xl p-5 text-gray-800">
        {/* Header */}
        {/* <header className="flex flex-col md:flex-row justify-between items-center border-b border-gray-200 mb-8 pb-4">
          <div className="text-2xl font-bold text-green-800">
            GreenAudit <span className="text-green-500">AI</span>
          </div>
          <nav className="mt-4 md:mt-0">
            <ul className="flex space-x-6">
              <li>
                <a href="#" className="text-green-700 font-semibold">
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-700 transition-colors"
                >
                  Insights
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-700 transition-colors"
                >
                  Settings
                </a>
              </li>
            </ul>
          </nav>
        </header> */}

        {/* Main Section */}
        <main>
          <h1 className="text-3xl font-semibold text-green-800 mb-8">Dashboard</h1>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="md:col-span-2 space-y-6">
              {/* Upload Card */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center text-green-800 font-semibold text-lg mb-4">
                  <span>Uploads</span>
                  <div>
                    <a
                      href="#"
                      className="text-green-600 mr-4 hover:underline font-medium"
                    >
                      Insights
                    </a>
                    <a href="#" className="text-gray-600 hover:underline">
                      Settings
                    </a>
                  </div>
                </div>
<div className="border-2 border-dashed border-green-500 bg-green-50 rounded-lg text-center py-10 px-6 mb-6">
  <p className="text-gray-600 mb-2">Upload your bills or activity logs</p>
  <p className="text-gray-600 mb-4">
    AI will calculate your carbon footprint instantly
  </p>

  {/* Hidden file input */}
  <input
    id="fileUpload"
    type="file"
    accept=".pdf,.jpg,.png"
    className="hidden"
    onChange={(e) => {
      if (e.target.files.length > 0) {
        alert(`Selected file: ${e.target.files[0].name}`);
      }
    }}
  />

  {/* Custom styled label acts as a button */}
  <label
    htmlFor="fileUpload"
    className="inline-block bg-green-500 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg cursor-pointer transition duration-200"
  >
    Choose File
  </label>

  {/* Secondary Upload button (optional for backend upload trigger) */}
  <button className="ml-3 bg-white text-green-700 border border-green-500 hover:bg-green-100 font-semibold px-5 py-2 rounded-lg transition duration-200">
    Upload Document
  </button>

  <p className="text-sm text-gray-500 mt-3">Accepted formats: .pdf, .jpg, .png</p>
</div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-3">
                    Recent Uploads
                  </h3>
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 font-medium text-gray-700">
                          Document 1
                        </td>
                        <td></td>
                        <td className="text-green-700 font-semibold text-right">
                          2kg CO<sub>2</sub>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 font-medium text-gray-700">
                          Document 2
                        </td>
                        <td></td>
                        <td className="text-green-700 font-semibold text-right">
                          5kg CO<sub>2</sub>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Monthly Footprint */}
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="text-lg font-semibold text-green-800 mb-2">
                  This Month’s Footprints
                </div>
                <div className="text-3xl font-bold text-green-700 mb-2">
                  127 kg CO<sub>2</sub>e
                </div>
                <div className="text-red-600 font-medium mb-3">
                  ↑15% from last month
                </div>
                <a
                  href="#"
                  className="text-green-600 font-semibold hover:underline"
                >
                  See Detailed Report
                </a>
              </div>

              {/* Insights */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-lg font-semibold text-green-800 mb-4">
                  Insights
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="font-semibold text-green-800 mb-1">
                      High-Impact Areas
                    </div>
                    <p className="text-gray-600">
                      Travel contributes 54% of your emissions
                    </p>
                  </div>

                  <div>
                    <div className="font-semibold text-green-800 mb-1">
                      AI Suggestion
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-gray-700">
                      Try switching to digital receipts
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default LandingPage;
