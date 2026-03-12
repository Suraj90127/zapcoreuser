import axios from "axios";

// const API_BASE_URL = "http://localhost:4001/api";
const API_BASE_URL = "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // future cookie auth ke liye
  
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

// Token interceptor
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });
