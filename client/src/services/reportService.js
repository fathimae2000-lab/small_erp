import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/reports`;

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const getDashboardReports = async (range = "monthly") => {
  const response = await axios.get(`${API_URL}?range=${range}`, authHeader());
  return response.data;
};

export default { getDashboardReports };