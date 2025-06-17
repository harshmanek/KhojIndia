import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // use this for cookies
  headers: {
    "Content-Type": "application/json",
  },
});
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const response = await api.post("/auth/refresh");
        // The new tokens will be set as cookies automatically

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
export default api;