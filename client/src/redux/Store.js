import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/ProductSlice"
import customerReducer from "./slices/customerSlice";
import userReducer from "./slices/userSlice";
import orderReducer from "./slices/saleSlice"; 
import purchaseReducer from "./slices/PurchaseSlice"
import inventoryReducer from "./slices/inventroySlice"
import reportReducer from "./slices/reportSlice"
import dashboardReducer from "./slices/dashboardSlice"
export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer, 
    customers: customerReducer, 
    users: userReducer, 
    purchases:purchaseReducer,
    sales:orderReducer,
    inventory:inventoryReducer,
    reports:reportReducer,
    dashboard:dashboardReducer
    
  },
});