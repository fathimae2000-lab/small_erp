import API from "../api/axios";

const saleService = {
  getAllOrders: async () => {
    const response = await API.get("/sales");
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await API.post("/sales", orderData);
    return response.data;
  },

  updateOrder: async (id, orderData) => {
    const response = await API.put(`/sales/${id}`, orderData);
    return response.data;
  },

  deleteOrder: async (orderId) => {
    await API.delete(`/sales/${orderId}`);
    return orderId;
  },
};

export default saleService;