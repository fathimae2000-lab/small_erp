import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout & Components
import AppLayout from "./components/AppLayout";
import Profile from "./components/Profile";

// Pages
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Customers from "./pages/Customers";
import Purchases from "./pages/Purchases";
import Login from "./pages/Auth";
import { useSelector } from "react-redux";




const ProtectedRoute = ({ children }) => {
  // 1. Check Redux state first
  const { token: reduxToken } = useSelector((state) => state.auth);
  
  // 2. Fallback to localStorage safely
  let localToken = localStorage.getItem("token");
  if (!localToken) {
    const userObj = localStorage.getItem("user");
    if (userObj) {
      try {
        const parsed = JSON.parse(userObj);
        localToken = parsed.token || parsed.data?.token;
      } catch (e) {
        console.error(e);
      }
    }
  }

  const finalToken = reduxToken || localToken;

  // Catch unauthenticated states, including stringified glitches
  if (!finalToken || finalToken === "undefined" || finalToken === "null") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const HomeRedirect = () => {
  let token = localStorage.getItem("token");

  if (!token) {
    const userObj = localStorage.getItem("user");
    if (userObj) {
      try {
        const parsed = JSON.parse(userObj);
        token = parsed.token || parsed.data?.token;
      } catch (e) {}
    }
  }

  return token ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  return (
    <>
      <Routes>
  {/* Root path: decides immediately where to send the visitor */}
  <Route path="/" element={<HomeRedirect />} />

  {/* Public Route */}
  <Route path="/login" element={<Login />} />

  {/* Protected Layout Layer */}
  <Route
    element={
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    }
  >
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/customers" element={<Customers />} />
    <Route path="/products" element={<Products />} />
    <Route path="/orders" element={<Orders />} />
    <Route path="/users" element={<Users />} />
    <Route path="/inventory" element={<Inventory />} />
    <Route path="/purchases" element={<Purchases />} />
    <Route path="/reports" element={<Reports />} />
    <Route path="/profile" element={<Profile />} />
  </Route>

  {/* Catch-all */}
  <Route path="*" element={<Navigate to="/login" replace />} />
</Routes>

      {/* Global Toast Notifications Config */}
      <ToastContainer position="top-right" autoClose={3000} newestOnTop />
    </>
  );
}

export default App;