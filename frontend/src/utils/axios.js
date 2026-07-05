import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://sport-space.onrender.com/api",
  withCredentials: true,
});

export default axiosInstance;
