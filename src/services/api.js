import axios from "axios";

const api = axios.create({
  baseURL: "https://pp-back.fooyer.space/api",
  timeout: 30000,
});

// Interceptor de resposta para padronizar erros
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error || "Erro inesperado. Tente novamente.";
    return Promise.reject(new Error(message));
  },
);

export default api;
