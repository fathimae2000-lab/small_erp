import API from "../api/axios";

const inventoryService = {
  getDashboard: async () => {
    const response = await API.get("/inventory/dashboard");
    return response.data;
  },

  adjustStock: async (productId, newStock) => {
    const response = await API.put("/inventory/adjust-stock", {
      productId,
      newStock,
    });
    return response.data;
  },
};

export default inventoryService;