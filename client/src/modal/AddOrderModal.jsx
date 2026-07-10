import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, User, ShoppingBag, CreditCard, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { createOrder, updateOrder } from "../redux/slices/saleSlice";
import { fetchProducts } from "../redux/slices/ProductSlice";
import { fetchCustomers } from "../redux/slices/customerSlice";

const emptyForm = {
  customer: "",
  items: [{ product: "", quantity: 1, price: 0 }],
  paymentMode: "Cash",
  soldBy: "65f1a2b3c4d5e6f7a8b9c0d1",
};

export default function AddOrderModal({ isOpen, onClose, order = null }) {
  const dispatch = useDispatch();

  const { products } = useSelector((state) => state.products);
  const { customers } = useSelector((state) => state.customers);
  const { loading } = useSelector((state) => state.sales);
  const isEditMode = Boolean(order);

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && products.length === 0) {
      dispatch(fetchProducts());
    }
    if (isOpen && customers.length === 0) {
      dispatch(fetchCustomers());
    }
  }, [isOpen, dispatch, products.length, customers.length]);

  // Pre-fill when editing
  useEffect(() => {
    if (isOpen) {
      if (order) {
        setFormData({
          customer: order.customer?._id || order.customer || "",
          items:
            order.items?.map((it) => ({
              product: it.product?._id || it.product || "",
              quantity: it.quantity || 1,
              price: it.price || 0,
            })) || emptyForm.items,
          paymentMode: order.paymentMode || "Cash",
          soldBy: order.soldBy?._id || order.soldBy || emptyForm.soldBy,
        });
      } else {
        setFormData(emptyForm);
      }
      setErrors({});
    }
  }, [isOpen, order]);

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
      updatedItems[index].price = selectedProduct ? selectedProduct.price : 0;
    } else {
      updatedItems[index][field] = Number(value);
    }

    setFormData({ ...formData, items: updatedItems });
    if (errors.items) setErrors({ ...errors, items: "" });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: "", quantity: 1, price: 0 }],
    });
  };

  const removeItemRow = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: updatedItems });
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.customer) tempErrors.customer = "Please select a customer";

    const genericItemError = formData.items.some((item) => !item.product || item.quantity < 1);
    if (genericItemError) {
      tempErrors.items = "Please ensure all rows have selected items and quantities greater than 0";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const finalPayload = {
      ...formData,
      totalAmount: calculateTotal(),
    };

    const result = isEditMode
      ? await dispatch(updateOrder({ id: order._id, orderData: finalPayload }))
      : await dispatch(createOrder(finalPayload));

    if (result.meta.requestStatus === "fulfilled") {
      toast.success(
        isEditMode ? "Order updated successfully! ✏️" : "Order created successfully! 🛒",
        { position: "top-right", autoClose: 3000, theme: "colored" }
      );
      setFormData(emptyForm);
      onClose();
    } else {
      const message =
        typeof result.payload === "string"
          ? result.payload
          : `Failed to ${isEditMode ? "update" : "create"} order`;
      toast.error(message);
    }
  };

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2B54D6]/10 text-[#2B54D6]">
              <ShoppingBag size={18} />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {isEditMode ? "Edit Sale Order" : "Create New Sale Order"}
            </h3>
          </div>
          <button onClick={handleCancel} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* Customer Select */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Customer</label>
            <div className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 transition-colors ${errors.customer ? 'border-rose-400 focus-within:border-rose-500' : 'border-slate-200 focus-within:border-[#2B54D6]/40'}`}>
              <User size={16} className="text-slate-400" />
              <select
                name="customer"
                value={formData.customer}
                onChange={handleTopLevelChange}
                className="w-full bg-transparent text-sm text-slate-700 outline-none"
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.customer && <p className="text-[11px] text-rose-500 font-medium pl-1">{errors.customer}</p>}
          </div>

          {/* Dynamic Order Items Rows Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Order Items</label>
              <button
                type="button"
                onClick={addItemRow}
                className="flex items-center gap-1 text-[11px] font-bold text-[#2B54D6] hover:underline"
              >
                <Plus size={14} /> Add Item Row
              </button>
            </div>

            <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-100">

                  <div className="col-span-6">
                    <select
                      value={item.product}
                      onChange={(e) => handleItemChange(index, "product", e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs text-slate-700 outline-none focus:border-[#2B54D6]/40"
                    >
                      <option value="">-- Choose Product --</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} (${p.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs text-center text-slate-700 outline-none focus:border-[#2B54D6]/40"
                    />
                  </div>

                  <div className="col-span-2 text-xs font-semibold text-slate-500 text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>

                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      disabled={formData.items.length === 1}
                      onClick={() => removeItemRow(index)}
                      className="text-slate-400 hover:text-rose-500 disabled:opacity-30 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {errors.items && <p className="text-[11px] text-rose-500 font-medium pl-1">{errors.items}</p>}
          </div>

          {/* Payment Mode & Running Total */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Payment Mode</label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 focus-within:border-[#2B54D6]/40">
                <CreditCard size={16} className="text-slate-400" />
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleTopLevelChange}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col justify-center items-end pr-2">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Payable</span>
              <span className="text-xl font-black text-slate-800">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 mt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#2B54D6] px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#1f3fa3] disabled:opacity-50"
            >
              {loading ? (isEditMode ? "Saving..." : "Processing...") : (isEditMode ? "Save Changes" : "Checkout Order")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}