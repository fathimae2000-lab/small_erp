import API from "../api/axios";

const customerService = {
  getAllCustomers: async () => {
    const response = await API.get("/customers");
    return response.data;
  },

  addCustomer: async (customerData) => {
    const response = await API.post("/customers", customerData);
    return response.data;
  },

  updateCustomer: async (id, customerData) => {
    const response = await API.put(`/customers/${id}`, customerData);
    return response.data;
  },
};

export default customerService;