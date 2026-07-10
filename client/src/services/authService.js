import API from "../api/axios";

// Normalizes the two most common backend response shapes:
//   { token, user }                -> flat
//   { user: { ...fields, token } } -> nested
// TODO: once you confirm your real API shape, delete the branch you don't need.
function extractAuthPayload(payload) {
  const token = payload?.token || payload?.user?.token || null;
  const user = payload?.user || null;
  return { token, user };
}

const authService = {
  login: async (credentials) => {
    const response = await API.post("/auth/login", credentials);
    return extractAuthPayload(response.data);
  },

  signup: async (userData) => {
    const response = await API.post("/auth/signup", userData);
    return response.data;
  },
};

export default authService;