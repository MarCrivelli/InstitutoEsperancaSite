import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isCancel(error) && error.code !== "ERR_CANCELED") {
      console.error(
        "Erro na requisição:",
        error.response?.data || error.message,
      );
    }

    return Promise.reject(error);
  },
);

export default api;