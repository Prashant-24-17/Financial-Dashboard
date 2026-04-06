const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const parseResponse = async (response) => {
  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
};

export const apiRequest = async (path, options = {}, userId) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (userId) {
    headers["x-user-id"] = userId;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  return parseResponse(response);
};

export const getSessionUsers = () => apiRequest("/session/users");
