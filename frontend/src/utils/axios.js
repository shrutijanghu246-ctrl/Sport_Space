import axios from "axios";

const axioInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true, //send cookies with every request automatically
});

export default axioInstance;
