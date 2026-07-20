import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData } from "../redux/slices/dashboardSlice"; 
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  AlertTriangle, 
  ChevronDown, 
  TrendingUp, 
  Users, 
  Clock, 
  Star,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Zap
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";

const badgeClasses = {
  danger: "bg-red-50 text-red-700 border border-red-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

function StatCard({ label, value, icon: Icon, from, to, blob, trend, trendLabel }) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-[0.04] blur-2xl transition-opacity duration-300 group-hover:opacity-10"
        style={{ backgroundColor: blob }}
      />

      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {trend && (
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
              <span className="text-xs text-slate-400">{trendLabel}</span>
            </div>
          )}
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm"
          style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        >
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  // ALL DATA FROM REDUX - NO MOCK DATA
  const salesTrendData = data?.salesTrend || [];
  const orderStatusData = data?.orderStatus || [];
  const topProductsData = data?.topProducts || [];

  const STATS = [
    {
      label: "Total Revenue",
      value: data?.stats?.totalRevenue ? `$${data.stats.totalRevenue.toLocaleString()}` : "$0",
      icon: DollarSign,
      from: "#2563EB",
      to: "#60A5FA",
      blob: "#2563EB",
      trend: data?.stats?.revenueGrowth,
      trendLabel: "vs last month"
    },
    {
      label: "Total Orders",
      value: data?.stats?.totalOrders || "0",
      icon: ShoppingCart,
      from: "#7C3AED",
      to: "#A78BFA",
      blob: "#7C3AED",
      trend: data?.stats?.ordersGrowth,
      trendLabel: "vs last month"
    },
    {
      label: "Products",
      value: data?.stats?.totalProducts || "0",
      icon: Package,
      from: "#059669",
      to: "#34D399",
      blob: "#059669",
      trend: data?.stats?.productsGrowth,
      trendLabel: "vs last month"
    },
    {
      label: "Low Stock Alert",
      value: data?.stats?.lowStockCount || "0",
      icon: AlertTriangle,
      from: "#DC2626",
      to: "#F87171",
      blob: "#DC2626",
      trend: data?.stats?.lowStockChange,
      trendLabel: "vs last month"
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="mt-3 text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-lg bg-red-50 px-6 py-4 text-red-700 border border-red-200">
          <p className="text-sm font-medium">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Welcome back! Here's your business overview</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow">
            Export Report
          </button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow">
            + Add Product
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Row 1: Revenue Trend + Orders by Status */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Trend Chart - DYNAMIC */}
        <div className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Revenue Trend</h3>
              <p className="text-xs text-slate-500">Daily revenue performance</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100">
                Weekly
              </button>
              <button className="rounded-lg px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50">
                Monthly
              </button>
              <button className="rounded-lg px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50">
                Yearly
              </button>
            </div>
          </div>
          <div className="h-64">
            {salesTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      padding: '8px 12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="rounded-full bg-slate-100 p-3">
                    <TrendingUp size={24} className="text-slate-400" />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">No revenue data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Orders by Status - DYNAMIC */}
        <div className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Orders by Status</h3>
              <p className="text-xs text-slate-500">Order distribution overview</p>
            </div>
            <ClockIcon size={18} className="text-slate-400" />
          </div>
          <div className="flex h-64 items-center">
            {orderStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      padding: '8px 12px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex w-full items-center justify-center">
                <div className="text-center">
                  <div className="rounded-full bg-slate-100 p-3">
                    <ShoppingCart size={24} className="text-slate-400" />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">No order status data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Top Selling Products + Low Stock */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Selling Products - DYNAMIC */}
        <div className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Top Selling Products</h3>
              <p className="text-xs text-slate-500">Best performing products by sales</p>
            </div>
            <Star size={18} className="text-amber-400" />
          </div>
          <div className="h-64">
            {topProductsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProductsData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                  <XAxis 
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      padding: '8px 12px'
                    }}
                    formatter={(value, name) => {
                      if (name === 'sales') return [`${value} units`, 'Sales'];
                      if (name === 'revenue') return [`$${value}`, 'Revenue'];
                      return [value, name];
                    }}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="#3B82F6"
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                  >
                    {topProductsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="rounded-full bg-slate-100 p-3">
                    <Package size={24} className="text-slate-400" />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">No product data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Section - DYNAMIC */}
        <div className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Low Stock Alert</h3>
              <p className="text-xs text-slate-500">Products requiring immediate attention</p>
            </div>
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div className="space-y-3">
            {data?.lowStockProducts?.length > 0 ? (
              data.lowStockProducts.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3 transition-all hover:border-slate-200 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${item.level === 'danger' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClasses[item.level]}`}>
                      {item.left} left
                    </span>
                    <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
                      Restock
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-6 text-center">
                <div className="mb-2 flex justify-center">
                  <div className="rounded-full bg-emerald-100 p-2">
                    <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm font-medium text-emerald-700">All products are well-stocked</p>
                <p className="text-xs text-emerald-600">No low stock items to display</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Orders + Recent Products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders - DYNAMIC */}
        <div className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent Orders</h3>
              <p className="text-xs text-slate-500">Latest transactions from your store</p>
            </div>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">
              View All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Customer</th>
                  <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-slate-400">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data?.recentOrders?.length > 0 ? (
                  data.recentOrders.map((order) => (
                    <tr key={order.id} className="group transition-colors hover:bg-slate-50/50">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
                            {order.initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{order.name}</p>
                            <p className="text-xs text-slate-400">{order.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right text-sm font-semibold text-slate-900">
                        {order.amount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="py-6 text-center text-sm text-slate-400">
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Products - DYNAMIC */}
        <div className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent Products</h3>
              <p className="text-xs text-slate-500">Newest additions to your inventory</p>
            </div>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">
              View All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Product</th>
                  <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-slate-400">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data?.recentProducts?.length > 0 ? (
                  data.recentProducts.map((product) => (
                    <tr key={product.name} className="group transition-colors hover:bg-slate-50/50">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <Package size={16} />
                          </div>
                          <span className="text-sm font-medium text-slate-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right text-sm font-semibold text-slate-900">
                        {product.amount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="py-6 text-center text-sm text-slate-400">
                      No recent products added
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}