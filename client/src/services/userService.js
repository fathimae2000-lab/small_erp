import API from "../api/axios";

const userService = {
  getAllUsers: async () => {
    const response = await API.get("/auth/all-users");
    return response.data;
  },

  createUser: async (userData) => {
    const response = await API.post("/auth/register", userData);
    return response.data;
  },
};

export default userService;