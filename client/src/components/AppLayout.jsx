import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; 
import Sidebar from "./Sidebar";
import AppBar from "./AppBar";
import ERPChatbot from "../components/ERPChatbot";

function pageNameFromPath(pathname) {
  const segment = pathname.split("/").filter(Boolean)[0] || "dashboard";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { token } = useSelector((state) => state.auth); 
  const activePage = pageNameFromPath(location.pathname);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  if (!token) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        active={activePage}
        onSelect={(name) => {
          const path = name.toLowerCase() === "dashboard" ? "/dashboard" : `/${name.toLowerCase()}`;
          navigate(path);
          setSidebarOpen(false);
        }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-screen flex-1 flex-col lg:ml-60">
        <AppBar title={activePage} onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      <ERPChatbot />
    </div>
  );
}