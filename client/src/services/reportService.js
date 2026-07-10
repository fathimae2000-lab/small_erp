import API from "../api/axios";

const reportService = {
  getDashboardReports: async (range) => {
    const response = await API.get("/reports/dashboard", {
      params: { range },
    });
    return response.data;
  },
};

export default reportService;