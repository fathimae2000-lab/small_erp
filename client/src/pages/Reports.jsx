import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReportsSummary, fetchReportsOrders } from "../redux/slices/reportSlice";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
  Download,
} from "lucide-react";
import {
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
} from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const formatCurrency = (amount) => {
  const n = Number(amount) || 0;
  return `$${n.toFixed(2)}`;
};

const toISODate = (d) => d.toISOString().split("T")[0];

function StatCard({ label, value, icon: Icon, from, to, blob }) {
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

export default function Reports() {
  const dispatch = useDispatch();
  const { summary, orders, pagination, summaryLoading, ordersLoading, error } =
    useSelector((state) => state.reports);

  const today = new Date();
  const defaultStart = new Date();
  defaultStart.setDate(today.getDate() - 30);

  const [startDate, setStartDate] = useState(toISODate(defaultStart));
  const [endDate, setEndDate] = useState(toISODate(today));
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchReportsSummary({ startDate, endDate }));
  }, [dispatch, startDate, endDate]);

  useEffect(() => {
    dispatch(fetchReportsOrders({ startDate, endDate, page, limit: 10 }));
  }, [dispatch, startDate, endDate, page]);

  const stats = summary?.stats || {};
  const revenueTrend = summary?.revenueTrend || [];
  const paymentBreakdown = summary?.paymentBreakdown || [];
  const topProducts = summary?.topProducts || [];
  const topCustomers = summary?.topCustomers || [];
  const customerMix = summary?.customerMix || { newCustomers: 0, returningCustomers: 0 };
  const lowStockProducts = summary?.lowStockProducts || [];
  const stockValuation = summary?.stockValuation || { totalValue: 0, totalUnits: 0 };

  const customerMixData = [
    { name: "New", value: customerMix.newCustomers },
    { name: "Returning", value: customerMix.returningCustomers },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      {/* Header + filters */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">Analyze performance over any date range</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
          />
          <span className="text-sm text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            min={startDate}
            max={toISODate(today)}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
          />
          <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Stat cards with growth vs previous period */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          from="#2563EB"
          to="#60A5FA"
          blob="#2563EB"
          trend={stats.revenueGrowth}
        />
        <StatCard
          label="Orders"
          value={stats.totalOrders || 0}
          icon={ShoppingCart}
          from="#7C3AED"
          to="#A78BFA"
          blob="#7C3AED"
          trend={stats.ordersGrowth}
        />
        <StatCard
          label="Avg Order Value"
          value={formatCurrency(stats.avgOrderValue)}
          icon={TrendingUp}
          from="#059669"
          to="#34D399"
          blob="#059669"
        />
        <StatCard
          label="Stock Value"
          value={formatCurrency(stockValuation.totalValue)}
          icon={Package}
          from="#DC2626"
          to="#F87171"
          blob="#DC2626"
        />
      </div>

      {/* Revenue trend for the selected range */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Revenue trend</h3>
        <div className="h-72">
          {revenueTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => [formatCurrency(v), "Revenue"]} />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">No data for this range</div>
          )}
        </div>
      </div>

      {/* Payment breakdown + customer mix + top customers */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Revenue by payment mode</h3>
          <div className="h-52">
            {paymentBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentBreakdown} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
                    {paymentBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">No data</div>
            )}
          </div>
          <div className="mt-2 space-y-1.5">
            {paymentBreakdown.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {p.name}
                </span>
                <span className="font-medium text-slate-900">{formatCurrency(p.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">New vs returning customers</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={customerMixData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
                  <Cell fill="#8B5CF6" />
                  <Cell fill="#10B981" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-purple-500" /> New: {customerMix.newCustomers}</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Returning: {customerMix.returningCustomers}</span>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Users size={16} className="text-slate-400" /> Top customers
          </h3>
          <div className="space-y-3">
            {topCustomers.length > 0 ? (
              topCustomers.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{c.name}</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(c.totalSpent)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No customer data for this range</p>
            )}
          </div>
        </div>
      </div>

      {/* Top products + low stock */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Top products by revenue</h3>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.sales} units sold</p>
                  </div>
                  <span className="font-semibold text-slate-900">{formatCurrency(p.revenue)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No product sales for this range</p>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Low stock (current)</h3>
          <div className="space-y-3">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{p.name}</span>
                  <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 border border-red-200">
                    {p.stock} left
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">All products well-stocked</p>
            )}
          </div>
        </div>
      </div>

      {/* Full paginated order table */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Order history</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                <th className="pb-2">Order</th>
                <th className="pb-2">Customer</th>
                <th className="pb-2">Sold by</th>
                <th className="pb-2">Payment</th>
                <th className="pb-2">Items</th>
                <th className="pb-2 text-right">Amount</th>
                <th className="pb-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {orders.length > 0 ? (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-medium text-slate-900">{o.id}</td>
                    <td className="py-3 text-slate-700">{o.customer}</td>
                    <td className="py-3 text-slate-500">{o.soldBy}</td>
                    <td className="py-3 text-slate-500">{o.paymentMode}</td>
                    <td className="py-3 text-slate-500">{o.itemCount}</td>
                    <td className="py-3 text-right font-semibold text-slate-900">{formatCurrency(o.amount)}</td>
                    <td className="py-3 text-right text-slate-400">{new Date(o.date).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-slate-400">
                    {ordersLoading ? "Loading..." : "No orders in this range"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} orders)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}