import axios from "axios";

// const API_BASE_URL = "http://localhost:4001/api";
const API_BASE_URL = "/api";
// 
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // future cookie auth ke liye
  
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

api.interceptors.request.use((config) => {
  // Add domain header
  config.headers['x-domain'] = window.location.hostname;
  // config.headers['x-domain'] = 'api-docs.space';
  
  // Add internal request header to bypass IP validation for docs
  config.headers['x-internal-request'] = 'true';
  
  console.log('Request headers:', config.headers); // Debug log
  
  return config;
});
