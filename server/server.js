const express = require('express');
const app = express();

require('dotenv').config({path:'./config/config.env'})

const errorHandler = require('./middlewares/errorHandler');

require("./config/db");

app.use(express.json());

const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',  
    'https://small-erp.vercel.app'  
  ],
  credentials: true
}));

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/ProductRoutes');
const saleRoutes = require('./routes/saleRoutes');
const customerRoutes = require('./routes/customerRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require("./routes/dashboardRoutes");
const chatRoutes = require("./routes/chatRoutes");
const searchRoutes = require('./routes/Dashboardsearchroutes')

app.use('/api/auth', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/message", chatRoutes);
app.use("/api/dashboard/search", searchRoutes);

app.use(errorHandler)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));