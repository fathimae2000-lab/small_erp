import API from "../api/axios";

const purchaseService = {
  getAllPurchases: async () => {
    const response = await API.get("/purchases");
    return response.data;
  },

  createPurchase: async (purchaseData) => {
    const response = await API.post("/purchases", purchaseData);
    return response.data;
  },
};

export default purchaseService;