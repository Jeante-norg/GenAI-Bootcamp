const API_BASE = "https://genai-bootcamp-hgp2.onrender.com";

const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API Request failed:", error);
    throw error;
  }
};

export const authAPI = {
  login: (email, password) =>
    apiRequest("/user/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signup: (username, email, password) =>
    apiRequest("/user/signup", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),

  logout: () =>
    apiRequest("/user/logout", {
      method: "POST",
    }),

  forgotPassword: (email) =>
    apiRequest("/user/forget-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  verifyOTP: (email, OTP, newPassword) =>
    apiRequest("/user/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, OTP, newPassword }),
    }),
};

export const carbonAPI = {
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/ai/generate`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await response.json();

    // Normalize RAG-enriched response — attach a ragEnhanced flag so the UI
    // can display a contextual badge without the API contract changing.
    if (data && data.data) {
      data.ragEnhanced =
        typeof data.data.calculated_with === "string" &&
        data.data.calculated_with.includes("CarbonKind");
      data.hasEquivalents =
        data.data.equivalents &&
        typeof data.data.equivalents === "object" &&
        Object.keys(data.data.equivalents).length > 0;
      data.hasAdvice =
        Array.isArray(data.data.advice) && data.data.advice.length > 0;
    }

    return data;
  },

  getUserEmissions: () => apiRequest("/ai/user-emissions"),

  deleteEmissionRecord: (recordId) =>
    apiRequest(`/ai/record/${recordId}`, {
      method: "DELETE",
    }),

  addManualEntry: (type, value, subtype, description) =>
    apiRequest("/ai/manual-entry", {
      method: "POST",
      body: JSON.stringify({
        type,
        value: parseFloat(value),
        subtype,
        description,
      }),
    }),

  updateEmissionRecord: (recordId, type, value, subtype, description) =>
    apiRequest(`/ai/record/${recordId}`, {
      method: "PUT",
      body: JSON.stringify({
        type,
        value: parseFloat(value),
        subtype,
        description,
      }),
    }),
};

export const userAPI = {
  getProfile: () => apiRequest("/user/profile"),

  updateProfile: (id, username, email) =>
    apiRequest(`/user/update/${id}`, {
      method: "PUT",
      body: JSON.stringify({ username, email }),
    }),

  updatePassword: (oldPassword, newPassword) =>
    apiRequest("/user/update-password", {
      method: "PUT",
      body: JSON.stringify({ oldPassword, newPassword }),
    }),
};

export const checkAuth = async () => {
  try {
    const response = await fetch(`${API_BASE}/ai/user-emissions`, {
      credentials: "include",
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export default {
  authAPI,
  carbonAPI,
  userAPI,
  checkAuth,
};
