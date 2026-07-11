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
  danger: "bg-rose-50 text-rose-600",
  warning: "bg-amber-50 text-amber-600",
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

      {/* Chart + low stock */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 transition-shadow duration-200 hover:shadow-lg">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#2B54D6] opacity-[0.06] blur-3xl" />
          <div className="relative mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Sales trend</p>
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
                <CartesianGrid vertical={false} stroke="#EEF1F8" />
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
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="url(#salesStroke)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#2B54D6", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  fill="url(#salesFill)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 transition-shadow duration-200 hover:shadow-lg">
          <div className="pointer-events-none absolute -right-8 -bottom-10 h-32 w-32 rounded-full bg-[#C0392B] opacity-[0.05] blur-3xl" />
          <p className="relative mb-3 text-sm font-semibold text-slate-800">Low stock products</p>
          <div className="relative flex flex-col gap-2.5">
            {data?.lowStockProducts?.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors duration-150 hover:bg-[#F7F9FE]"
              >
                <span className="flex items-center gap-2 text-sm text-slate-700">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      item.level === "danger" ? "bg-rose-500" : "bg-amber-500"
                    }`}
                  />
                  {item.name}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                    badgeClasses[item.level] || "bg-slate-100 text-slate-600"
                  }`}
                >
                  {item.left} left
                </span>
              </div>
            ))}
            {(!data?.lowStockProducts || data.lowStockProducts.length === 0) && (
              <p className="text-xs text-slate-400 text-center py-4">All products have sufficient stock! 👍</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent orders + recent products */}
      <div className="relative grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 transition-shadow duration-200 hover:shadow-lg">
          <p className="mb-3 text-sm font-semibold text-slate-800">Recent orders</p>
          <table className="w-full border-collapse text-sm">
            <tbody>
              {data?.recentOrders?.map((order, i) => (
                <tr
                  key={order.id}
                  className={`transition-colors duration-150 hover:bg-[#F7F9FE] ${
                    i > 0 ? "border-t border-slate-50" : ""
                  }`}
                >
                  <td className="py-2 pl-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#2B54D6]/10 to-[#4FD5F0]/10 text-[11px] font-semibold text-[#2B54D6]">
                        {order.initials}
                      </div>
                      <div>
                        <p className="text-slate-700">{order.name}</p>
                        <p className="text-[11px] text-slate-400">{order.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 pr-1.5 text-right font-medium text-slate-800">
                    {order.amount}
                  </td>
                </tr>
              ))}
              {(!data?.recentOrders || data.recentOrders.length === 0) && (
                <tr>
                  <td colSpan="2" className="text-xs text-slate-400 text-center py-4">No recent orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 transition-shadow duration-200 hover:shadow-lg">
          <p className="mb-3 text-sm font-semibold text-slate-800">Recent products</p>
          <table className="w-full border-collapse text-sm">
            <tbody>
              {data?.recentProducts?.map((product, i) => (
                <tr
                  key={product.name}
                  className={`transition-colors duration-150 hover:bg-[#F7F9FE] ${
                    i > 0 ? "border-t border-slate-50" : ""
                  }`}
                >
                  <td className="py-2 pl-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#0E7C8C]/10 to-[#4FD5C5]/10 text-[#0E7C8C]">
                        <Package size={13} />
                      </div>
                      <span className="text-slate-700">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-2 pr-1.5 text-right font-medium text-slate-800">
                    {product.amount}
                  </td>
                </tr>
              ))}
              {(!data?.recentProducts || data.recentProducts.length === 0) && (
                <tr>
                  <td colSpan="2" className="text-xs text-slate-400 text-center py-4">No recent products added.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Floating scroll-down button */}
        <button className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-500 shadow-md transition-all duration-200 hover:-translate-y-[calc(50%+2px)] hover:text-[#2B54D6] hover:shadow-lg">
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  );
}