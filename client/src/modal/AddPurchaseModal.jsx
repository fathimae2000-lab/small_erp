import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, User, ShoppingBag, CreditCard, Plus, Trash2 } from "lucide-react";
import { fetchProducts } from "../redux/slices/ProductSlice";
 import { createPurchase } from "../redux/slices/PurchaseSlice";
import { toast } from "react-toastify";

export default function AddPurchaseModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  
  const { products } = useSelector((state) => state.products);
  const { loading } = useSelector((state) => state.purchases);

  const [formData, setFormData] = useState({
    supplierName: "",
    items: [{ product: "", quantity: 1, purchasePrice: 0 }],
    paymentMode: "Cash",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [isOpen, dispatch, products.length]);

  if (!isOpen) return null;

  const handleTopLevelChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

 const handleItemChange = (index, field, value) => {
  const updatedItems = [...formData.items];
  if (field === "product") {
    const selectedProduct = products.find((p) => p._id === value);
    updatedItems[index].product = value;
    updatedItems[index].purchasePrice = selectedProduct
      ? (selectedProduct.costPrice ?? selectedProduct.price ?? 0)
      : 0;
  } else {
    updatedItems[index][field] = Number(value);
  }
  setFormData({ ...formData, items: updatedItems });
  if (errors.items) setErrors({ ...errors, items: "" });
};

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: "", quantity: 1, purchasePrice: 0 }],
    });
  };

  const removeItemRow = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: updatedItems });
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((acc, item) => acc + item.purchasePrice * item.quantity, 0);
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.supplierName.trim()) tempErrors.supplierName = "Supplier name is required";
    
    const hasInvalidItems = formData.items.some((item) => !item.product || item.quantity < 1 || item.purchasePrice <= 0);
    if (hasInvalidItems) {
      tempErrors.items = "Please select a product, quantity, and valid purchase price for all rows.";
    }
    


    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

      
    const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const result = await dispatch(createPurchase(formData));

  if (result.meta.requestStatus === "fulfilled") {
    toast.success("Purchase recorded successfully! 📦", {
      position: "top-right",
      autoClose: 3000,
      theme: "colored",
    });
    setFormData({
      supplierName: "",
      items: [{ product: "", quantity: 1, purchasePrice: 0 }],
      paymentMode: "Cash",
    });
    onClose();
  } else {
    const message =
      typeof result.payload === "string"
        ? result.payload
        : "Failed to save purchase";
    toast.error(message);
  }
};
  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2B54D6]/10 text-[#2B54D6]">
              <ShoppingBag size={18} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Add New Purchase Stock</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          
          {/* Supplier Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Supplier Name</label>
            <div className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 ${errors.supplierName ? 'border-rose-400' : 'border-slate-200'}`}>
              <User size={16} className="text-slate-400" />
              <input
                type="text"
                name="supplierName"
                placeholder="e.g., Wholesale Distributors Ltd"
                value={formData.supplierName}
                onChange={handleTopLevelChange}
                className="w-full bg-transparent text-sm text-slate-700 outline-none"
              />
            </div>
            {errors.supplierName && <p className="text-[11px] text-rose-500 pl-1">{errors.supplierName}</p>}
          </div>

          {/* Items Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Stock Items</label>
              <button type="button" onClick={addItemRow} className="flex items-center gap-1 text-[11px] font-bold text-[#2B54D6] hover:underline">
                <Plus size={14} /> Add Row
              </button>
            </div>

            <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                  
                  {/* Product */}
                  <div className="col-span-5">
                    <select
                      value={item.product}
                      onChange={(e) => handleItemChange(index, "product", e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs text-slate-700 outline-none"
                    >
                      <option value="">-- Product --</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Qty */}
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs text-center text-slate-700 outline-none"
                    />
                  </div>

                  {/* Purchase Price */}
                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="Cost Price"
                      value={item.purchasePrice || ""}
                      onChange={(e) => handleItemChange(index, "purchasePrice", e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs text-center text-slate-700 outline-none"
                    />
                  </div>

                  {/* Delete Button */}
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      disabled={formData.items.length === 1}
                      onClick={() => removeItemRow(index)}
                      className="text-slate-400 hover:text-rose-500 disabled:opacity-30"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {errors.items && <p className="text-[11px] text-rose-500 pl-1">{errors.items}</p>}
          </div>

          {/* Payment & Total */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Payment Mode</label>
              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleTopLevelChange}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-700 outline-none"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Credit">Credit</option>
              </select>
            </div>

            <div className="flex flex-col justify-center items-end pr-2">
              <span className="text-[11px] font-medium text-slate-400 uppercase">Total Bill</span>
              <span className="text-xl font-black text-slate-800">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 mt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="rounded-lg bg-[#2B54D6] px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#1f3fa3]">
              Save Purchase
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}