import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData } from "../redux/slices/dashboardSlice"; 
import { DollarSign, ShoppingCart, Package, AlertTriangle, ChevronDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const badgeClasses = {
  danger: "bg-rose-50 text-rose-600 ring-1 ring-rose-200/50",
  warning: "bg-amber-50 text-amber-600 ring-1 ring-amber-200/50",
};

function StatCard({ label, value, icon: Icon, from, to, blob }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_16px_32px_-10px_rgba(30,41,90,0.28)]">
      {/* decorative glow blob */}
      <div
        className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full opacity-[0.10] blur-2xl transition-opacity duration-300 group-hover:opacity-20"
        style={{ backgroundColor: blob }}
      />

      <div className="relative flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md"
          style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
        >
          <Icon size={17} />
        </div>
      </div>

      <p className="relative mt-3 text-[13px] text-slate-500">{label}</p>
      <p
        className="relative bg-clip-text text-[26px] font-semibold leading-tight text-transparent"
        style={{ backgroundImage: `linear-gradient(90deg, ${from}, ${to})` }}
      >
        {value}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const STATS = [
    {
      label: "Total revenue",
      value: data?.stats?.totalRevenue ? `$${data.stats.totalRevenue.toLocaleString()}` : "$0",
      icon: DollarSign,
      from: "#2B54D6",
      to: "#4FD5F0",
      blob: "#2B54D6",
    },
    {
      label: "Orders",
      value: data?.stats?.totalOrders || "0",
      icon: ShoppingCart,
      from: "#5B3FE0",
      to: "#8B7BFF",
      blob: "#5B3FE0",
    },
    {
      label: "Products",
      value: data?.stats?.totalProducts || "0",
      icon: Package,
      from: "#0E7C8C",
      to: "#4FD5C5",
      blob: "#0E7C8C",
    },
    {
      label: "Low stock",
      value: data?.stats?.lowStockCount || "0",
      icon: AlertTriangle,
      from: "#C0392B",
      to: "#F0836B",
      blob: "#C0392B",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F5FA]">
        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading Dashboard Metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F5FA]">
        <p className="text-sm font-medium text-rose-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3F5FA] to-[#EDF0F9] p-6 text-slate-900">
      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Chart + low stock - Enhanced with glassmorphism and gradient borders */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Chart Card - Glassmorphism with gradient accent */}
        <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
          {/* Gradient border accent */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#2B54D6] via-[#4FD5F0] to-[#2B54D6] opacity-10 p-[1px] pointer-events-none" />
          
          <div className="relative p-5">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#2B54D6] opacity-[0.06] blur-3xl" />
            
            <div className="relative mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#2B54D6] to-[#4FD5F0] shadow-md">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Sales Trend</p>
                  <p className="text-xs text-slate-400">Last 7 days performance</p>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600 ring-1 ring-slate-200/50">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </div>
            </div>
            
            <div className="relative h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.salesTrend || []}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2B54D6" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#2B54D6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="salesStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2B54D6" />
                      <stop offset="100%" stopColor="#4FD5F0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#EEF1F8" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#A3ABC2" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#A3ABC2" }}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 10,
                      border: "1px solid #EEF1F8",
                      background: "rgba(255,255,255,0.9)",
                      backdropFilter: "blur(8px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="url(#salesStroke)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#2B54D6", strokeWidth: 0 }}
                    activeDot={{ r: 6, stroke: "#4FD5F0", strokeWidth: 2 }}
                    fill="url(#salesFill)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Low Stock Card - Premium gradient design */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-rose-50/30 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
          {/* Gradient border accent */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-500 via-amber-400 to-rose-500 opacity-10 p-[1px] pointer-events-none" />
          
          <div className="relative p-5">
            <div className="pointer-events-none absolute -right-8 -bottom-10 h-32 w-32 rounded-full bg-[#C0392B] opacity-[0.05] blur-3xl" />
            
            <div className="relative mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-amber-400 shadow-md">
                  <AlertTriangle size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Low Stock Products</p>
                  <p className="text-xs text-slate-400">Items needing attention</p>
                </div>
              </div>
              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-600 ring-1 ring-rose-200/50">
                {data?.lowStockProducts?.length || 0}
              </span>
            </div>
            
            <div className="relative flex flex-col gap-2.5">
              {data?.lowStockProducts?.map((item) => (
                <div
                  key={item.name}
                  className="group flex items-center justify-between rounded-xl bg-white/60 px-3 py-2.5 transition-all duration-200 hover:bg-white hover:shadow-md hover:translate-x-1"
                >
                  <span className="flex items-center gap-2.5 text-sm text-slate-700">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        item.level === "danger" ? "bg-rose-500 animate-pulse" : "bg-amber-500"
                      }`}
                    />
                    <span className="font-medium">{item.name}</span>
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 ${
                      badgeClasses[item.level] || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.left} left
                  </span>
                </div>
              ))}
              {(!data?.lowStockProducts || data.lowStockProducts.length === 0) && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="mb-2 rounded-full bg-emerald-50 p-2 ring-1 ring-emerald-200/50">
                    <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-emerald-600">All Products Stocked</p>
                  <p className="text-xs text-slate-400 mt-0.5">Everything looks great!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent orders + recent products - Modern card design with icons and hover effects */}
      <div className="relative grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Orders - Enhanced with gradient header */}
        <div className="group rounded-2xl bg-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 overflow-hidden">
          {/* Gradient header accent */}
          <div className="h-1 bg-gradient-to-r from-[#2B54D6] via-[#5B3FE0] to-[#4FD5F0]" />
          
          <div className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#2B54D6] to-[#4FD5F0] shadow-md">
                  <ShoppingCart size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Recent Orders</p>
                  <p className="text-xs text-slate-400">Latest transactions</p>
                </div>
              </div>
              <button className="text-xs font-medium text-[#2B54D6] hover:text-[#4FD5F0] transition-colors duration-200 hover:underline">
                View All →
              </button>
            </div>
            
            <div className="divide-y divide-slate-50">
              {data?.recentOrders?.map((order, i) => (
                <div
                  key={order.id}
                  className="group/order flex items-center justify-between py-2.5 transition-all duration-200 hover:pl-1 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-transparent"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2B54D6]/10 to-[#4FD5F0]/10 text-xs font-bold text-[#2B54D6] transition-all duration-200 group-hover/order:scale-110 group-hover/order:shadow-md">
                      {order.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{order.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{order.id}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    {order.amount}
                  </span>
                </div>
              ))}
              {(!data?.recentOrders || data.recentOrders.length === 0) && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="mb-2 rounded-full bg-slate-50 p-2 ring-1 ring-slate-200/50">
                    <Package size={20} className="text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-400">No orders yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Products - Enhanced with gradient header */}
        <div className="group rounded-2xl bg-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 overflow-hidden">
          {/* Gradient header accent */}
          <div className="h-1 bg-gradient-to-r from-[#0E7C8C] via-[#4FD5C5] to-[#0E7C8C]" />
          
          <div className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0E7C8C] to-[#4FD5C5] shadow-md">
                  <Package size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Recent Products</p>
                  <p className="text-xs text-slate-400">Newest additions</p>
                </div>
              </div>
              <button className="text-xs font-medium text-[#0E7C8C] hover:text-[#4FD5C5] transition-colors duration-200 hover:underline">
                View All →
              </button>
            </div>
            
            <div className="divide-y divide-slate-50">
              {data?.recentProducts?.map((product, i) => (
                <div
                  key={product.name}
                  className="group/product flex items-center justify-between py-2.5 transition-all duration-200 hover:pl-1 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-transparent"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#0E7C8C]/10 to-[#4FD5C5]/10 text-[#0E7C8C] transition-all duration-200 group-hover/product:scale-110 group-hover/product:shadow-md">
                      <Package size={15} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{product.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    {product.amount}
                  </span>
                </div>
              ))}
              {(!data?.recentProducts || data.recentProducts.length === 0) && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="mb-2 rounded-full bg-slate-50 p-2 ring-1 ring-slate-200/50">
                    <Package size={20} className="text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-400">No products yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating scroll-down button - Enhanced with glassmorphism */}
        <button className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-slate-500 shadow-lg transition-all duration-300 hover:bg-white hover:-translate-y-[calc(50%+2px)] hover:text-[#2B54D6] hover:shadow-xl ring-1 ring-white/50 border border-white/30">
          <ChevronDown size={18} className="transition-transform duration-300 group-hover:scale-110" />
        </button>
      </div>
    </div>
  );
}