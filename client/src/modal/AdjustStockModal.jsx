import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { X, Sliders, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function AdjustStockModal({ isOpen, onClose, onSave, initialProductId = null }) {
  const { inventoryList } = useSelector((state) => state.inventory);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [currentStock, setCurrentStock] = useState(0);
  const [adjustmentType, setAdjustmentType] = useState("add");
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedProductId(initialProductId || "");
      setAdjustmentType("add");
      setQuantity("");
    }
  }, [isOpen, initialProductId]);

  useEffect(() => {
    if (selectedProductId) {
      const prod = inventoryList.find((p) => p._id === selectedProductId);
      setCurrentStock(prod ? prod.stock || 0 : 0);
    } else {
      setCurrentStock(0);
    }
  }, [selectedProductId, inventoryList]);

  if (!isOpen) return null;

  const isEditMode = Boolean(initialProductId);
  const adjustQty = Number(quantity) || 0;
  const finalStockPreview =
    adjustmentType === "add" ? currentStock + adjustQty : currentStock - adjustQty;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductId || !quantity || adjustQty <= 0) return;

    if (adjustmentType === "subtract" && finalStockPreview < 0) {
      toast.error("Stock cannot be negative!");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSave) {
        await onSave({
          productId: selectedProductId,
          adjustmentType,
          quantity: adjustQty,
          finalStock: finalStockPreview,
        });
      }
      setSelectedProductId("");
      setQuantity("");
      onClose();
    } catch (error) {
      console.error("Adjustment failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-[#2B54D6] to-[#4FD5F0] text-white">
              <Sliders size={15} />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Adjust Stock</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">

          {/* Select Product */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              Select Product
            </label>
            <select
              required
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              disabled={isEditMode}
              className={`w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none shadow-sm transition-colors focus:border-[#2B54D6]/40 ${
                isEditMode ? "bg-slate-50 cursor-not-allowed text-slate-500" : "bg-white"
              }`}
            >
              <option value="">-- Choose a product --</option>
              {inventoryList.map((prod) => (
                <option key={prod._id} value={prod._id}>
                  {prod.name} ({prod.sku || "No SKU"})
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Indicator */}
          {selectedProductId && (
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm border border-slate-100">
              <span className="text-slate-500">Current available stock:</span>
              <span className="font-semibold text-slate-800">{currentStock} units</span>
            </div>
          )}

          {/* Adjustment Action Radio */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Adjustment Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType("add")}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition-all ${
                  adjustmentType === "add"
                    ? "border-emerald-500 bg-emerald-50/50 text-emerald-600 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                + Add Stock
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType("subtract")}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition-all ${
                  adjustmentType === "subtract"
                    ? "border-rose-500 bg-rose-50/50 text-rose-600 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                - Remove Stock
              </button>
            </div>
          </div>

          {/* Quantity & Preview Calculation Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                Quantity
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none shadow-sm transition-colors focus:border-[#2B54D6]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                Updated Preview
              </label>
              <div className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-bold shadow-sm ${
                finalStockPreview < 0
                  ? "border-rose-200 bg-rose-50 text-rose-600"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}>
                {finalStockPreview} units
              </div>
            </div>
          </div>

          {/* Validation Warning Notice */}
          {adjustmentType === "subtract" && finalStockPreview < 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-600 border border-rose-100">
              <AlertCircle size={14} className="shrink-0" />
              <span>Warning: Action will result in negative stock inventory level.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (adjustmentType === "subtract" && finalStockPreview < 0)}
              className="rounded-xl bg-gradient-to-r from-[#2B54D6] to-[#4FD5F0] px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? "Updating..." : "Apply Adjustment"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}