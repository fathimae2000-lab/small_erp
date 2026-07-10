import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReportsData } from "../redux/slices/reportSlice"; 
import { TrendingUp, DollarSign, ShoppingBag, Box, Download } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const PIE_COLORS = ["#10b981", "#f59e0b", "#f43f5e"];

function StatCard({ label, value, icon: Icon, from, to, blob }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_16px_32px_-10px_rgba(30,41,90,0.28)]">
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

export default function Reports() {
  const dispatch = useDispatch();
  const [range, setRange] = useState("Last 7 months");

  const { stats, revenueData, ordersByStatus, topProducts, loading, error } = 
    useSelector((state) => state.reports);

  useEffect(() => {
    dispatch(fetchReportsData(range));
  }, [dispatch, range]);

  // CSV Export Logic Handler
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    // 1. Core Summary Section
    csvContent += "DASHBOARD SUMMARY METRICS\n";
    csvContent += `Total Sales, $${stats?.totalSales?.toLocaleString() || 0}\n`;
    csvContent += `Total Orders, ${stats?.totalOrders || 0}\n`;
    csvContent += `Total Products, ${stats?.totalProducts || 0}\n`;
    csvContent += `Low Stock Alerts, ${stats?.lowStockCount || 0} Items\n\n`;

    // 2. Revenue Trend Section
    csvContent += "REVENUE TREND DATA\nTimeline Period, Revenue\n";
    revenueData.forEach((row) => {
      csvContent += `${row.month}, ${row.revenue}\n`;
    });
    csvContent += "\n";

    // 3. Top Selling Products Section (ഡൈനാമിക് ഡാറ്റ എക്സ്പോർട്ട് ചെയ്യുന്നു)
    csvContent += "TOP SELLING PRODUCTS\nProduct Name, Units Sold\n";
    if (topProducts && topProducts.length > 0) {
      topProducts.forEach((product) => {
        csvContent += `"${product.name.replace(/"/g, '""')}", ${product.sold || 0}\n`;
      });
    }

    // Create a virtual download anchor element link
    const encodedUri = encodeURI(csvContent);
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", encodedUri);
    downloadLink.setAttribute("download", `ERP_Dashboard_Report_${range.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(downloadLink);
    
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const STATS_CARDS = [
    {
      label: "Total Sales",
      value: stats?.totalSales ? `$${stats.totalSales.toLocaleString()}` : "$0",
      icon: DollarSign,
      from: "#2B54D6",
      to: "#4FD5F0",
      blob: "#2B54D6",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders || "0",
      icon: ShoppingBag,
      from: "#5B3FE0",
      to: "#8B7BFF",
      blob: "#5B3FE0",
    },
    {
      label: "Total Products",
      value: stats?.totalProducts || "0",
      icon: Box,
      from: "#B7791F",
      to: "#F0B84F",
      blob: "#B7791F",
    },
    {
      label: "Low Stock Alerts",
      value: stats?.lowStockCount !== undefined ? `${stats.lowStockCount} Items` : "0 Items",
      icon: TrendingUp,
      from: "#F43F5E",
      to: "#FDA4AF",
      blob: "#F43F5E",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F5FA]">
        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading ERP Analytics...</p>
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
      {/* Header + range filter */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Analytics</p>
          <h1 className="text-lg font-semibold text-slate-800">Reports</h1>
        </div>
        
        {/* Action Group Container */}
        <div className="flex items-center gap-2">
          {/* Export CSV Action Trigger */}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 rounded-lg cursor-pointer bg-[#042ad1] px-3 py-2 text-sm font-medium text-white shadow-sm outline-none transition-all hover:bg-[#0732f5] active:scale-95"
          >
            <Download size={15} className="text-white-500" />
            Export CSV
          </button>

          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="w-44 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition-colors focus:border-[#2B54D6]/40"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 7 months</option>
            <option>This year</option>
          </select>
        </div>
      </div>

      {/* Dynamic Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS_CARDS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Revenue trend + orders by status */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 transition-shadow duration-200 hover:shadow-lg">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#2B54D6] opacity-[0.06] blur-3xl" />
          <div className="relative mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Revenue trend</p>
          </div>
          <div className="relative h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2B54D6" />
                    <stop offset="100%" stopColor="#4FD5F0" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#EEF1F8" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#A3ABC2" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#A3ABC2" }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  formatter={(v) => `$${v.toLocaleString()}`}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 10,
                    border: "1px solid #EEF1F8",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="url(#revenueStroke)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#2B54D6", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 transition-shadow duration-200 hover:shadow-lg">
          <p className="mb-3 text-sm font-semibold text-slate-800">Orders by status</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {ordersByStatus.map((entry, i) => (
                    <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 10,
                    border: "1px solid #EEF1F8",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={30}
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top selling products */}
      <div className="h-[340px] rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">Top selling products</p>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Units sold</span>
        </div>

        <div className="h-[260px] w-full">
          {topProducts && topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid horizontal={false} stroke="#EEF1F8" />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#A3ABC2" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  width={120}
                  tick={{ fontSize: 12, fill: "#475569" }}
                />
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} units · $${(props.payload.revenue || 0).toLocaleString()}`,
                    "Sold",
                  ]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 10,
                    border: "1px solid #EEF1F8",
                  }}
                />
                <Bar dataKey="sold" fill="#2B54D6" radius={[0, 4, 4, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-xs text-slate-400">No sales data recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}