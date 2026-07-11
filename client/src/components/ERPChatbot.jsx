

import React, { useState, useRef, useEffect, useCallback } from "react";
import { FiSend, FiX, FiMessageSquare, FiRefreshCw } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";

// ── ERP redux thunks (adjust paths if your slices live elsewhere) ──
import { fetchOrders } from "../redux/slices/saleSlice";
import { fetchPurchases } from "../redux/slices/PurchaseSlice";
import { fetchInventoryDashboard } from "../redux/slices/inventroySlice";
import { fetchCustomers } from "../redux/slices/customerSlice";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const CHAT_API_URL =
  import.meta.env.VITE_CHAT_API_URL || "http://localhost:5000/api/message";
const MAX_HISTORY = 20;

// ─── QUICK PROMPT CHIPS ───────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  "Summarize today's sales",
  "Which items are low on stock?",
  "Any pending purchase bills?",
  "Who are my top customers?",
  "How much revenue this month?",
  "What's out of stock right now?",
  "Show recent orders",
  "Which supplier do we owe the most?",
];

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const buildSystemPrompt = ({ orders, purchases, inventory, inventorySummary, customers }) =>
  `You are a helpful ERP assistant for a small business operations team.
Today's date is ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}.

You have access to the following live workspace data:

ORDERS / SALES (${orders.length} total):
${JSON.stringify(orders.slice(0, 80))}

PURCHASES (${purchases.length} total):
${JSON.stringify(purchases.slice(0, 80))}

INVENTORY (${inventory.length} items):
${JSON.stringify(inventory.slice(0, 80))}

INVENTORY SUMMARY:
- Total stock value: $${(inventorySummary?.totalStockValue ?? 0).toLocaleString()}
- Low stock items: ${inventorySummary?.lowStockCount ?? 0}
- Total unique products: ${inventorySummary?.totalUniqueItems ?? 0}

CUSTOMERS (${customers.length} total):
${JSON.stringify(customers.slice(0, 80))}

Guidelines:
- Answer only based on the data above. Do not invent records.
- Use bullet points when listing multiple items.
- Include name and key details when referencing any record (order ID, supplier, product, customer).
- When asked about revenue, use the ORDERS/SALES data (totalAmount fields), not purchase costs.
- When asked about stock, use INVENTORY and INVENTORY SUMMARY.
- Keep replies under 200 words unless the user asks for a detailed breakdown.
- Format dates as DD/MM/YYYY.`.trim();

// ─── TOKEN HELPER ─────────────────────────────────────────────────────────────
// ─── CORRECTED TOKEN HELPER ──────────────────────────────────────────────────
const getToken = () => {
  // 1. Declare the token variable properly with let
  let token = 
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("token");

  // 2. If it's not found directly, check inside the nested 'user' object
  if (!token) {
    const userObj = localStorage.getItem("user");
    if (userObj) {
      try {
        const parsed = JSON.parse(userObj);
        token = parsed.token || parsed.data?.token;
      } catch (e) {
        console.error("Chatbot token parsing error:", e);
      }
    }
  }

  // 3. Return the string token or an empty fallback
  return token || "";
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
const Chatbot = () => {
  const dispatch = useDispatch();

  // ERP data already lives in these slices — read straight from the store.
  const { orders = [], loading: ordersLoading } = useSelector((state) => state.sales) || {};
  const { purchases = [], loading: purchasesLoading } = useSelector((state) => state.purchases) || {};
  const { inventoryList = [], summary: inventorySummary = {}, loading: inventoryLoading } =
    useSelector((state) => state.inventory) || {};
  const { customers = [], loading: customersLoading } = useSelector((state) => state.customers) || {};

  const [isOpen, setIsOpen]                     = useState(false);
  const [input, setInput]                       = useState("");
  const [isLoading, setIsLoading]               = useState(false);
  const [history, setHistory]                   = useState([]);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const [messages, setMessages]                 = useState([
    {
      id: 1,
      text: "Hello! 👋 I'm your ERP Assistant.\nAsk me about your sales, purchases, inventory, or customers — or pick a quick question below.",
      isBot: true,
    },
  ]);

  const [dataLoading, setDataLoading] = useState(false);
  const [dataLoaded, setDataLoaded]   = useState(false);

  const bottomRef = useRef(null);

  // ── Fetch all ERP dashboard data the chatbot needs ────────────────────────
  const fetchAllErpData = useCallback(async () => {
    setDataLoading(true);

    const results = await Promise.allSettled([
      dispatch(fetchOrders()).unwrap(),
      dispatch(fetchPurchases()).unwrap(),
      dispatch(fetchInventoryDashboard()).unwrap(),
      dispatch(fetchCustomers()).unwrap(),
    ]);

    results.forEach((r) => {
      if (r.status === "rejected") {
        console.error("Chatbot data fetch failed:", r.reason);
      }
    });

    setDataLoading(false);
    setDataLoaded(true);
  }, [dispatch]);

  // ── Fetch data once, the first time the chatbot is opened ────────────────
  useEffect(() => {
    if (isOpen && !dataLoaded && !dataLoading) {
      fetchAllErpData();
    }
  }, [isOpen, dataLoaded, dataLoading, fetchAllErpData]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || isLoading) return;

    setShowQuickPrompts(false);
    setInput("");

    setMessages((prev) => [...prev, { id: Date.now(), text: userText, isBot: false }]);
    setIsLoading(true);

    const updatedHistory = [
      ...history,
      { role: "user", content: userText },
    ].slice(-MAX_HISTORY);

    try {
      const res = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
        body: JSON.stringify({
          model:      "claude-sonnet-4-6",
          max_tokens: 1024,
          system:     buildSystemPrompt({ orders, purchases, inventory: inventoryList, inventorySummary, customers }),
          messages:   updatedHistory,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Server error ${res.status}`);
      }

      const data = await res.json();

      const reply =
        data.reply ||
        data.content?.[0]?.text ||
        data.message ||
        "Sorry, I received an unexpected response.";

      setHistory([
        ...updatedHistory,
        { role: "assistant", content: reply },
      ].slice(-MAX_HISTORY));

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: reply, isBot: true },
      ]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: `⚠️ ${err.message || "Could not reach the server. Check your API setup."}`,
          isBot: true,
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  // ── Reset conversation ────────────────────────────────────────────────────
  const handleReset = () => {
    setMessages([{
      id: Date.now(),
      text: "Conversation cleared! What would you like to know about your ERP data?",
      isBot: true,
    }]);
    setHistory([]);
    setShowQuickPrompts(true);
  };

  // ── Manual refresh of ERP data ────────────────────────────────────────────
  const handleRefreshData = () => {
    setDataLoaded(false); // triggers re-fetch via the effect above
  };

  const isDataBusy =
    (dataLoading && !dataLoaded) ||
    ordersLoading ||
    purchasesLoading ||
    inventoryLoading ||
    customersLoading;

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans antialiased">

      {/* Toggle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open ERP Assistant"
          className="flex items-center justify-center w-14 h-14 rounded-2xl text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
          style={{
            backgroundImage: "linear-gradient(135deg, #2B54D6, #4FD5F0)",
            boxShadow: "0 12px 24px -8px rgba(43,84,214,0.45)",
          }}
        >
          <div className="relative w-8 h-8 flex items-center justify-center bg-white/15 rounded-xl">
            <FiMessageSquare size={20} />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#2B54D6] animate-pulse" />
          </div>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[520px] bg-white rounded-3xl border border-slate-100 shadow-2xl flex flex-col overflow-hidden">

          {/* ── Header ── */}
          <div
            className="px-4 py-3.5 flex items-center justify-between text-white shrink-0"
            style={{ backgroundImage: "linear-gradient(135deg, #2B54D6, #4FD5F0)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center border border-white/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2a10 10 0 0 1 10 10v1a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-1A10 10 0 0 1 12 2z" />
                  <circle cx="9" cy="11" r="1" fill="currentColor" />
                  <circle cx="15" cy="11" r="1" fill="currentColor" />
                  <path d="M16 16c0 1.1-.9 2-2 2h-4a2 2 0 0 1-2-2" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wide">ERP Assistant</h3>
                <p className="text-[10px] text-white/80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full inline-block" />
                  {isLoading ? "Thinking…" : isDataBusy ? "Loading data…" : "Online"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleRefreshData}
                title="Refresh ERP data"
                disabled={isDataBusy}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors disabled:opacity-40"
              >
                <FiRefreshCw size={15} className={isDataBusy ? "animate-spin" : ""} />
              </button>
              <button
                onClick={handleReset}
                title="Clear conversation"
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
              >
                <FiMessageSquare size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
              >
                <FiX size={17} />
              </button>
            </div>
          </div>

          {/* ── Live data counts bar ── */}
          <div className="flex items-center px-4 py-2 bg-[#F7F9FE] border-b border-slate-100 shrink-0">
            {[
              { label: "Orders",    count: orders.length,       color: "text-[#2B54D6]" },
              { label: "Purchases", count: purchases.length,    color: "text-[#0E7C8C]" },
              { label: "Inventory", count: inventoryList.length,color: "text-[#B7791F]" },
              { label: "Customers", count: customers.length,    color: "text-[#5B3FE0]" },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex flex-col items-center flex-1">
                <span className={`text-xs font-bold ${color}`}>
                  {isDataBusy ? "…" : count}
                </span>
                <span className="text-[9px] text-slate-400">{label}</span>
              </div>
            ))}
          </div>

          {/* ── Messages ── */}
          <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-[#F9FAFD] to-[#F3F5FA] space-y-3">

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap break-words ${
                    msg.isBot
                      ? msg.isError
                        ? "bg-rose-50 text-rose-600 border border-rose-100 rounded-tl-none"
                        : "bg-white text-slate-700 border border-slate-100 shadow-sm rounded-tl-none"
                      : "text-white shadow-sm rounded-tr-none"
                  }`}
                  style={
                    !msg.isBot
                      ? { backgroundImage: "linear-gradient(135deg, #2B54D6, #4FD5F0)" }
                      : undefined
                  }
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Quick prompt chips */}
            {showQuickPrompts && messages.length === 1 && (
              <div className="pt-1">
                <p className="text-[10px] text-slate-400 mb-2 font-medium">Try asking:</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      disabled={isDataBusy}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[#2B54D6] hover:bg-[#2B54D6]/5 hover:border-[#2B54D6]/30 transition-colors shadow-sm disabled:opacity-40"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── Input ── */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Ask about sales, stock, purchases…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-[#2B54D6]/40 focus:bg-white transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 text-white rounded-xl transition-all shrink-0 disabled:opacity-40 active:scale-95 hover:shadow-md"
              style={{ backgroundImage: "linear-gradient(135deg, #2B54D6, #4FD5F0)" }}
            >
              <FiSend size={14} />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};

export default Chatbot;