import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem("token");

    if (!token || token === "undefined") {
      const userObj = localStorage.getItem("user");
      if (userObj) {
        try {
          const parsedUser = JSON.parse(userObj);
          token = parsedUser.token || parsedUser.data?.token;
        } catch (e) {
          console.error("Error parsing user object", e);
        }
      }
    }

    if (!token || token === "undefined") {
      token = localStorage.getItem("authToken");
    }

    if (token && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("Axios: Valid token not found yet!");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;